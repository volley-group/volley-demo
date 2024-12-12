import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed')({
  component: () => <MainLayout />,
  beforeLoad: async ({ context: { hc, userId } }) => {
    if (!userId) {
      console.log('redirecting to signin', userId);
      throw redirect({ to: '/sign-in/$' });
    }
    return await hc.user.$get().then((r) => r.json());
  },
});

export const MainLayout = () => {
  return (
    <div className="flex min-h-svh">
      {/* <AppNavbar /> */}
      <div className="flex flex-1 flex-col pt-16">
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
