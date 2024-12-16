import { userQuery } from '@/data/user';
import { queryClient } from '@/lib/clients';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/signed-in')({
  component: () => {},
  loader: async ({ context: { hc } }) => {
    const { to } = await hc['handle-sign-in'].$get().then((r) => r.json());
    await queryClient.fetchQuery(userQuery);
    throw redirect({ to });
  },
});
