import { AppNavbar } from '@/components/app-navbar';
import { hc } from '@/lib/clients';
import { queryOptions } from '@tanstack/react-query';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

const userQuery = queryOptions({
  queryKey: ['user'],
  queryFn: () => hc['user'].$get().then((r) => r.json()),
});

const userIdQuery = queryOptions({
  queryKey: ['userId'],
  queryFn: () => hc['userId'].$get().then((r) => r.json()),
});

export const Route = createFileRoute('/_authed')({
  component: () => <MainLayout />,
  loader: async ({ context: { queryClient } }) => {
    const { userId } = await queryClient.fetchQuery(userIdQuery);
    if (!userId) {
      console.log('redirecting to signin', userId);
      throw redirect({ to: '/sign-in/$' });
    }
    return await queryClient.ensureQueryData(userQuery);
  },
});

export const MainLayout = () => {
  return (
    <div className="flex min-h-svh">
      <AppNavbar />
      <div className="flex flex-1 flex-col pt-16">
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
