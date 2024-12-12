import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

// const userInfo = createServerFn({ method: "GET" }).handler(async () => {
//   const { userId } = await getAuth(getWebRequest());

//   if (!userId) throw redirect({ to: "/sign-in/$" });

//   const clerk = await clerkClient({
//     secretKey: Resource.ClerkSecretKey.value,
//   });

//   const accessTokens = (await clerk.users.getUserOauthAccessToken(userId!, "oauth_slack")).data;
//   console.log(accessTokens);
//   const token = accessTokens[0].token || "";
//   const userInfo = await client.openid.connect.userInfo({
//     token,
//   });
//   console.log(userInfo);
//   const [savedUser] = await db
//     .insert(UserTable)
//     .values({
//       id: userId,
//       externalId: userInfo["https://slack.com/user_id"]!,
//       email: userInfo.email!,
//       name: userInfo.name!,
//       avatarUrl: userInfo.picture,
//     })
//     .onConflictDoNothing()
//     .returning();

//   const [existingInstallation] = await db
//     .select({
//       id: SlackInstallationTable.id,
//     })
//     .from(SlackInstallationTable)
//     .where(eq(SlackInstallationTable.teamId, userInfo["https://slack.com/team_id"]!));

//   if (!existingInstallation) {
//     throw redirect({ to: "/slack/install" });
//   }

//   console.log(savedUser);
//   throw redirect({ to: "/feed" });
// });

export const Route = createFileRoute('/signed-in')({
  component: Component,
})

function Component() {
  const { hc } = Route.useRouteContext()
  const navigate = useNavigate()
  useEffect(() => {
    hc['handle-sign-in']
      .$get()
      .then((r) => r.json())
      .then(({ to }) => {
        console.log(to);
        navigate({ to });
      });
  }, []);
}
