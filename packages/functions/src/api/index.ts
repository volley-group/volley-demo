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
import {
  ConfigTable,
  SlackInstallationTable,
  StatusMessageTable,
  UserInstallations,
  UserTable,
} from '../drizzle/schema.sql';
import { authenticatedMiddleware, clerkMiddleware } from './middleware';
import { and, eq, getTableColumns, inArray } from 'drizzle-orm';
import feeds from '../feeds';

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
      console.log('response', response);
      const userInfo = await slack.openid.connect.userInfo({
        token: response.authed_user!.access_token!,
      });
      console.log('userInfo', userInfo);
      const user = await db.query.UserTable.findFirst({
        where: eq(UserTable.email, userInfo.email!),
      });

      if (!user) {
        console.log('User not found, redirecting to sign-in');
        const redirectUrl = Resource.Config.PERMANENT_STAGE ? '/sign-in' : 'http://localhost:5173/sign-in';
        return c.redirect(redirectUrl);
      }

      const installation = await db.transaction(async (tx) => {
        const [installation] = await tx
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

        await tx.insert(UserInstallations).values({
          userId: user.id,
          installationId: installation.id,
        });
        return installation;
      });

      console.log('Saved new installation', installation.id);
      const joinResponse = await slack.conversations.join({
        token: installation.botToken,
        channel: installation.incomingWebhook.channelId,
      });
      if (!joinResponse.ok) {
        console.error('Failed to join channel', joinResponse.error);
      }
      console.log('Joined channel', joinResponse);
      const redirectUrl = Resource.Config.PERMANENT_STAGE ? '/config' : 'http://localhost:5173/config';
      return c.redirect(redirectUrl);
    }
  )
  .get('/products', async (c) => {
    const products = await Promise.all(feeds.map((f) => f.toJson()));
    return c.json({ products }, 200);
  })
  .get('/user', async (c) => {
    const requestState = c.get('requestState');
    if (requestState.status !== 'signed-in') {
      return c.json(null);
    }
    const userId = requestState.toAuth().userId;
    const user = await db.query.UserTable.findFirst({
      where: eq(UserTable.id, userId),
      with: {
        installations: {
          with: {
            installation: {
              columns: {
                id: true,
                teamId: true,
                teamName: true,
              },
            },
          },
        },
      },
    }).then((user) => ({ ...user!, installations: user?.installations.map((i) => i.installation) }));
    return c.json(user);
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
    const slackTokens = accessTokens.filter((t) => t.provider === 'oauth_slack');
    const tokenInfos = await Promise.all(
      slackTokens.map(async (t) => {
        const tokenInfo = await slack.openid.connect.userInfo({
          token: t.token,
        });
        return {
          teamId: tokenInfo['https://slack.com/team_id']!,
          userId: tokenInfo['https://slack.com/user_id']!,
          email: tokenInfo.email!,
          name: tokenInfo.name!,
          picture: tokenInfo.picture,
        };
      })
    );

    await db
      .insert(UserTable)
      .values({
        id: userId!,
        externalId: tokenInfos[0].userId,
        email: tokenInfos[0].email!,
        name: tokenInfos[0].name!,
        avatarUrl: tokenInfos[0].picture,
      })
      .onConflictDoNothing();

    const installations = await db
      .select()
      .from(SlackInstallationTable)
      .where(
        inArray(
          SlackInstallationTable.teamId,
          tokenInfos.map((t) => t.teamId)
        )
      );
    if (installations.length !== tokenInfos.length) {
      console.log('Signed in with new installation, redirecting to install');
      return c.json({ to: '/slack/install' }, 200);
    }
    // const existingInstallations = tokenInfos.filter((t) => installations.some((i) => i.teamId === t.teamId));
    // await db
    //   .insert(UserInstallations)
    //   .values(
    //     existingInstallations.map((t) => ({
    //       userId: userId,
    //       installationId: installations.find((i) => i.teamId === t.teamId)!.id!,
    //     }))
    //   )
    //   .onConflictDoNothing();

    return c.json({ to: '/feed' }, 200);
  })
  .get('/status-messages', zValidator('query', z.object({ installationId: z.string() })), async (c) => {
    const { userId } = c.get('auth');
    const { installationId } = c.req.valid('query');
    const installation = await db.query.UserInstallations.findFirst({
      where: and(eq(UserInstallations.userId, userId), eq(UserInstallations.installationId, Number(installationId))),
      with: {
        installation: {
          with: {
            configs: true,
          },
        },
      },
    }).then((u) => u?.installation);

    const messages = await db
      .select({
        ...getTableColumns(StatusMessageTable),
      })
      .from(StatusMessageTable)
      .where(
        inArray(
          StatusMessageTable.product,
          installation!.configs.map((c) => c.product)
        )
      );

    return c.json({ teamId: installation!.teamId, messages }, 200);
  })
  .get('/configs', zValidator('query', z.object({ installationId: z.string() })), async (c) => {
    const { userId } = c.get('auth');
    const { installationId } = c.req.valid('query');
    const installations = await db.query.UserInstallations.findMany({
      where: and(eq(UserInstallations.userId, userId), eq(UserInstallations.installationId, Number(installationId))),
      with: {
        installation: true,
      },
    }).then((u) => u.map((i) => i.installation));
    const teamConfigs = await db
      .select({ ...getTableColumns(ConfigTable) })
      .from(ConfigTable)
      .innerJoin(SlackInstallationTable, eq(ConfigTable.installationId, SlackInstallationTable.id))
      .where(
        inArray(
          SlackInstallationTable.teamId,
          installations.map((i) => i.teamId)
        )
      );
    return c.json({ configs: teamConfigs }, 200);
  })
  .post(
    '/configs',
    zValidator(
      'json',
      z.object({
        product: z.string(),
        service: z.string(),
        action: z.enum(['add', 'remove']),
        installationId: z.number(),
      })
    ),
    async (c) => {
      const { product, service, action, installationId } = c.req.valid('json');
      const { userId } = c.get('auth');

      const installation = await db.query.UserInstallations.findFirst({
        where: and(eq(UserInstallations.userId, userId), eq(UserInstallations.installationId, installationId)),
        with: {
          installation: true,
        },
      }).then((u) => u!.installation);

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
