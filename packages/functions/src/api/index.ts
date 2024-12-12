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
import { and, eq, getTableColumns, inArray } from 'drizzle-orm';
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
      const response = await slack.oauth.v2.access({
        code: code,
        client_id: Resource.SlackClientId.value,
        client_secret: Resource.SlackClientSecret.value,
        redirect_uri: `https://${Resource.Config.DOMAIN}/api/auth/slack/oauth_redirect`,
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
  .get('/products', async (c) => {
    const products = await Promise.all(feeds.map((f) => f.toJson()));
    return c.json({ products }, 200);
  })
  .get('/userId', async (c) => {
    const requestState = c.get('requestState');
    return c.json({ userId: requestState.status === 'signed-in' ? requestState.toAuth().userId : null }, 200);
  })
  .get('/installation-url', async (c) => {
    const params = new URLSearchParams({
      client_id: Resource.SlackClientId.value,
      scope: scopes.join(','),
      user_scope: userScopes.join(','),
      redirect_uri: `https://${Resource.Config.DOMAIN}/api/auth/slack/oauth_redirect`,
    });

    return c.json(`https://slack.com/oauth/v2/authorize?${params.toString()}`);
  })
  .use(authenticatedMiddleware())
  .get('/handle-sign-in', async (c) => {
    const { userId } = c.get('auth');
    const clerk = c.get('clerk');
    const accessTokens = (await clerk.users.getUserOauthAccessToken(userId!, 'oauth_slack')).data;
    const token = accessTokens[0].token || '';
    const userInfo = await slack.openid.connect.userInfo({
      token,
    });
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
    const [user] = await db.select().from(UserTable).where(eq(UserTable.id, userId));
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
  .get('/configs', async (c) => {
    const { userId } = c.get('auth');
    const [user] = await db.select().from(UserTable).where(eq(UserTable.id, userId));
    const teamConfigs = await db
      .select({ ...getTableColumns(ConfigTable) })
      .from(ConfigTable)
      .innerJoin(SlackInstallationTable, eq(ConfigTable.installationId, SlackInstallationTable.id))
      .where(eq(SlackInstallationTable.teamId, user.teamId));
    return c.json({ configs: teamConfigs }, 200);
  })
  .post(
    '/configs',
    zValidator('json', z.object({ product: z.string(), service: z.string(), action: z.enum(['add', 'remove']) })),
    async (c) => {
      const { product, service, action } = c.req.valid('json');
      const { userId } = c.get('auth');
      const [user] = await db.select().from(UserTable).where(eq(UserTable.id, userId));
      const [installation] = await db
        .select({ id: SlackInstallationTable.id })
        .from(SlackInstallationTable)
        .where(eq(SlackInstallationTable.teamId, user.teamId));

      const updatedConfig = await db.transaction(async (tx) => {
        const [config] = await tx
          .select()
          .from(ConfigTable)
          .where(and(eq(ConfigTable.product, product), eq(ConfigTable.installationId, installation.id)));

        const [updatedConfig] = await tx
          .insert(ConfigTable)
          .values({ product, services: [service], installationId: installation.id })
          .onConflictDoUpdate({
            target: [ConfigTable.installationId, ConfigTable.product],
            set: {
              services: config
                ? action === 'add'
                  ? [...config.services, service]
                  : config.services.filter((s) => s !== service)
                : [service],
            },
          })
          .returning();
        return updatedConfig;
      });

      return c.json({ config: updatedConfig }, 200);
    }
  );

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
