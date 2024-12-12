import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { createClerkClient } from '@clerk/backend';
import { initTRPC } from '@trpc/server';
import type { inferAsyncReturnType } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { ConfigTable, SlackInstallationTable, StatusMessageTable, UserTable } from '../drizzle/schema.sql';
import { db } from '../drizzle';
import { scopes, userScopes } from '../slack';
import { slack } from '../slack';
import { getTableColumns } from 'drizzle-orm';
import { z } from 'zod';
import { getFeeds } from '../feeds';
import type { IService } from '../types';
import { Resource } from 'sst';
import type { SignedInAuthObject } from '@clerk/backend/internal';

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  console.log(opts);
  const clerk = await createClerkClient({
    secretKey: Resource.ClerkSecretKey.value,
    publishableKey: Resource.Config.VITE_CLERK_PUBLISHABLE_KEY,
  });
  const requestState = await clerk.authenticateRequest(opts.req, {
    secretKey: Resource.ClerkSecretKey.value,
    publishableKey: Resource.Config.VITE_CLERK_PUBLISHABLE_KEY,
  });
  return { requestState: requestState, clerk };
};
export type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

const authedProc = t.procedure.use(({ ctx, next }) => {
  if (!ctx.requestState || ctx.requestState.status !== 'signed-in') {
    throw new Error('Unauthorized');
  }
  const auth = ctx.requestState.toAuth() as SignedInAuthObject;
  return next({ ctx: { ...ctx, auth: auth } });
});

export const router = t.router({
  ping: t.procedure.query(() => {
    return 'pong';
  }),
  getUserId: t.procedure.query(async ({ ctx }) => {
    console.log(ctx.requestState);
    return ctx.requestState.status === 'signed-in' ? { userId: ctx.requestState.toAuth().userId } : { userId: null };
  }),
  getUser: authedProc.input(z.object({ userId: z.string() })).query(async ({ input, ctx: { clerk } }) => {
    const accessTokens = (await clerk.users.getUserOauthAccessToken(input.userId!, 'oauth_slack')).data;
    const token = accessTokens[0].token || '';
    const userInfo = await slack.openid.connect.userInfo({
      token,
    });
    const [installation] = await db
      .select({ id: SlackInstallationTable.id })
      .from(SlackInstallationTable)
      .where(eq(SlackInstallationTable.teamId, userInfo['https://slack.com/team_id']!));
    return {
      userId: input.userId,
      teamId: userInfo['https://slack.com/team_id']!,
      installationId: installation!.id,
    };
  }),
  handleSignIn: authedProc.query(async ({ ctx: { auth, clerk } }) => {
    const { userId } = auth;
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
      .onConflictDoNothing()
      .returning();

    const [existingInstallation] = await db
      .select({
        id: SlackInstallationTable.id,
      })
      .from(SlackInstallationTable)
      .where(eq(SlackInstallationTable.teamId, savedUser.teamId));

    if (!existingInstallation) {
      return { to: '/slack/install' };
    }

    console.log(savedUser);
    return { to: '/feed' };
  }),
  getInstallationUrl: t.procedure.query(async () => {
    const params = new URLSearchParams({
      client_id: Resource.SlackClientId.value,
      scope: scopes.join(','),
      user_scope: userScopes.join(','),
      redirect_uri:
        'https://b4bd5w7k5n3jqfd4cxqxvpyhum0jyojq.lambda-url.us-east-1.on.aws/api/auth/slack/oauth_redirect',
    });

    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  }),
  getFeedsAndConfigs: t.procedure.input(z.object({ teamId: z.string() })).query(async ({ input }) => {
    const teamConfigs = await db
      .select({ ...getTableColumns(ConfigTable), teamId: SlackInstallationTable.teamId })
      .from(ConfigTable)
      .innerJoin(SlackInstallationTable, eq(ConfigTable.installationId, SlackInstallationTable.id))
      .where(eq(SlackInstallationTable.teamId, input.teamId));
    const products = await getFeeds();
    const services = await products.reduce(
      async (acc, product) => {
        const services = await product.getServices();
        return {
          ...(await acc),
          [product.name]: services,
        };
      },
      Promise.resolve({} as Record<string, IService[]>)
    );
    const productsWithServices = products.map((product) => ({
      name: product.name,
      displayName: product.displayName,
      logo: product.logo,
      services: services[product.name],
    }));
    return { products: productsWithServices, teamConfigs };
  }),
  getStatusMessages: authedProc.query(async ({ ctx: { auth, clerk } }) => {
    const { userId } = auth;
    const [user] = await db.select().from(UserTable).where(eq(UserTable.id, userId));
    const messages = await db
      .select({
        ...getTableColumns(StatusMessageTable),
      })
      .from(StatusMessageTable)
      .innerJoin(SlackInstallationTable, eq(ConfigTable.installationId, SlackInstallationTable.id))
      .where(eq(SlackInstallationTable.teamId, user.teamId));
    return { teamId: user.teamId, messages };
  }),
});
