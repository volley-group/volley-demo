import { AppNavbar } from '@/components/app-navbar';
import { userQuery } from '@/data/user';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed')({
  component: () => <MainLayout />,
  loader: async ({ context: { queryClient } }) => {
    const user = await queryClient.ensureQueryData(userQuery);
    if (!user?.id) {
      console.log('redirecting to signin', user?.id);
      throw redirect({ to: '/sign-in/$' });
    }
    return user;
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
