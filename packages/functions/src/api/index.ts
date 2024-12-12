import { Hono } from 'hono';
import { handle } from 'hono/aws-lambda';
import { trimTrailingSlash } from 'hono/trailing-slash';
import { trpcServer } from '@hono/trpc-server';
import { createContext, router } from './trpc';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { slack } from '../slack';
import { Resource } from 'sst';
import { db } from '../drizzle';
import { SlackInstallationTable, UserTable } from '../drizzle/schema.sql';
import { authenticatedMiddleware, clerkMiddleware } from './middleware';
import { eq, getTableColumns } from 'drizzle-orm';

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
        .onConflictDoNothing()
        .returning();
      console.log('Saved new installation', installation.id);
      const redirectUrl = Resource.Config.PERMANENT_STAGE ? 'http://localhost:5173/feed' : '/feed';
      return c.redirect(redirectUrl);
    }
  )
  .get('/userId', async (c) => {
    const requestState = c.get('requestState');
    return c.json({ userId: requestState.status === 'signed-in' ? requestState.toAuth().userId : null }, 200);
  })
  .use(authenticatedMiddleware())
  .get('/user', async (c) => {
    const userId = c.get('auth').userId;
    const [userWithInstallation] = await db
      .select({ ...getTableColumns(UserTable), installationId: SlackInstallationTable.id })
      .from(UserTable)
      .innerJoin(SlackInstallationTable, eq(UserTable.teamId, SlackInstallationTable.teamId))
      .where(eq(UserTable.id, userId));

    return c.json({ user: userWithInstallation });
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
  })
  .use(
    '/trpc/*',
    trpcServer({
      router,
      createContext,
    })
  );

export type ApiRoutes = typeof api;
export type TrpcRoutes = typeof router;
export const handler = handle(routes);
