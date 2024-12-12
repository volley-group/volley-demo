import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { trimTrailingSlash } from 'hono/trailing-slash';
// import { trpcServer } from '@hono/trpc-server';
// import { createContext, router } from './trpc';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { scopes, slack, userScopes } from '../slack';
import { Resource } from 'sst';
import { db } from '../drizzle';
import { ConfigTable, SlackInstallationTable, StatusMessageTable, UserTable } from '../drizzle/schema.sql';
import { authenticatedMiddleware, clerkMiddleware } from './middleware';
import { eq, getTableColumns, inArray } from 'drizzle-orm';
import feeds from '../feeds';
import type { IService } from '../types';

const api = new Hono()
  .get('/ping', async (c) => {
    console.log('ping');
    return c.json({ message: 'pong' });
  })
  .get(
    '/auth/slack/oauth_redirect',
    zValidator('query', z.object({ code: z.string(), state: z.string().optional() })),
    async (c) => {
      const { code } = c.req.valid('query');
      console.log(code);
      console.log(new URL(c.req.url).origin);
      console.log(Resource.Config.PERMANENT_STAGE);
      const response = await slack.oauth.v2.access({
        code: code,
        client_id: Resource.SlackClientId.value,
        client_secret: Resource.SlackClientSecret.value,
        redirect_uri: `${new URL(c.req.url).origin}/api/auth/slack/oauth_redirect`,
      });

      const [installation] = await db
        .insert(SlackInstallationTable)
        .values({
          teamId: response.team!.id!,
          teamName: response.team!.name!,
          botUserId: response.bot_user_id!,
          botToken: response.access_token!,
          botScopes: response.scope!,
          incomingWebhook: {
            channel: response.incoming_webhook!.channel!,
            channelId: response.incoming_webhook!.channel_id!,
            configurationUrl: response.incoming_webhook!.configuration_url!,
            url: response.incoming_webhook!.url!,
          },
        })
        .onConflictDoUpdate({
          // We need to do an update here to make returning() actually return something
          target: [SlackInstallationTable.teamId],
          set: {
            teamName: response.team!.name!,
          },
        })
        .returning();
      console.log('Saved new installation', installation.id);
      const redirectUrl = Resource.Config.PERMANENT_STAGE ? '/feed' : 'http://localhost:5173/feed';
      return c.redirect(redirectUrl);
    }
  )
  .get('/userId', async (c) => {
    const requestState = c.get('requestState');
    return c.json({ userId: requestState.status === 'signed-in' ? requestState.toAuth().userId : null }, 200);
  })
  .get('/installation-url', async (c) => {
    const params = new URLSearchParams({
      client_id: Resource.SlackClientId.value,
      scope: scopes.join(','),
      user_scope: userScopes.join(','),
      redirect_uri:
        'https://b4bd5w7k5n3jqfd4cxqxvpyhum0jyojq.lambda-url.us-east-1.on.aws/api/auth/slack/oauth_redirect',
    });

    return c.json(`https://slack.com/oauth/v2/authorize?${params.toString()}`);
  })
  .use(authenticatedMiddleware())
  .get('/handle-sign-in', async (c) => {
    const { userId } = c.get('auth');
    const clerk = c.get('clerk');
    const accessTokens = (await clerk.users.getUserOauthAccessToken(userId!, 'oauth_slack')).data;
    console.log(accessTokens);
    const token = accessTokens[0].token || '';
    const userInfo = await slack.openid.connect.userInfo({
      token,
    });
    console.log(userInfo);
    const [savedUser] = await db
      .insert(UserTable)
      .values({
        id: userId!,
        externalId: userInfo['https://slack.com/user_id']!,
        email: userInfo.email!,
        name: userInfo.name!,
        avatarUrl: userInfo.picture,
        teamId: userInfo['https://slack.com/team_id']!,
      })
      .onConflictDoUpdate({
        // We need to do an update here to make returning() actually return something. Sad but true
        target: [UserTable.id],
        set: {
          teamId: userInfo['https://slack.com/team_id']!,
        },
      })
      .returning();
    console.log(savedUser);

    const [existingInstallation] = await db
      .select({
        id: SlackInstallationTable.id,
      })
      .from(SlackInstallationTable)
      .where(eq(SlackInstallationTable.teamId, savedUser.teamId));

    if (!existingInstallation) {
      console.log('No installation found, redirecting to install');
      return c.json({ to: '/slack/install' }, 200);
    }

    return c.json({ to: '/feed' }, 200);
  })
  .get('/user', async (c) => {
    const userId = c.get('auth').userId;
    console.log(userId);
    const [user] = await db.select().from(UserTable).where(eq(UserTable.id, userId));
    console.log(user);
    const [installation] = await db
      .select({ id: SlackInstallationTable.id })
      .from(SlackInstallationTable)
      .where(eq(SlackInstallationTable.teamId, user.teamId));

    return c.json({ ...user, installationId: installation.id });
  })
  .get('/status-messages', async (c) => {
    const { userId } = c.get('auth');
    const [user] = await db.select().from(UserTable).where(eq(UserTable.id, userId));
    const team = await db.query.SlackInstallationTable.findFirst({
      where: eq(SlackInstallationTable.teamId, user.teamId),
      columns: { id: true },
      with: {
        configs: true,
      },
    });
    const messages = await db
      .select({
        ...getTableColumns(StatusMessageTable),
      })
      .from(StatusMessageTable)
      .where(
        inArray(
          StatusMessageTable.product,
          team!.configs.map((c) => c.product)
        )
      );

    return c.json({ teamId: user.teamId, messages }, 200);
  })
  .get('/get-feed-and-configs', async (c) => {
    const { userId } = c.get('auth');
    const [user] = await db.select().from(UserTable).where(eq(UserTable.id, userId));
    const teamConfigs = await db
      .select({ ...getTableColumns(ConfigTable), teamId: SlackInstallationTable.teamId })
      .from(ConfigTable)
      .innerJoin(SlackInstallationTable, eq(ConfigTable.installationId, SlackInstallationTable.id))
      .where(eq(SlackInstallationTable.teamId, user.teamId));
    const services = await feeds.reduce(
      async (acc, product) => {
        const services = await product.getServices();
        return {
          ...(await acc),
          [product.name]: services,
        };
      },
      Promise.resolve({} as Record<string, IService[]>)
    );
    const productsWithServices = feeds.map((product) => ({
      name: product.name,
      displayName: product.displayName,
      logo: product.logo,
      services: services[product.name],
    }));
    return c.json({ products: productsWithServices, teamConfigs }, 200);
  });

const routes = new Hono()
  .use(trimTrailingSlash())
  .use(
    clerkMiddleware({
      secretKey: Resource.ClerkSecretKey.value,
      publishableKey: Resource.Config.VITE_CLERK_PUBLISHABLE_KEY,
    })
  )
  .route('/api', api)
  .get('/ping', async (c) => {
    console.log('ping');
    return c.body('pong');
  });
// .use(
//   '/trpc/*',
//   trpcServer({
//     router,
//     createContext,
//   })
// );

export type ApiRoutes = typeof api;
// export type TrpcRoutes = typeof router;
export const handler = handle(routes);
