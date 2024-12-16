import { Toaster } from '@/components/ui/sonner';
import { userQuery } from '@/data/user';
import { RouterContext } from '@/lib/router';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import React from 'react';
import { Suspense } from 'react';

const TanStackRouterDevtools =
  process.env.NODE_ENV === 'production'
    ? () => null
    : React.lazy(() =>
        import('@tanstack/router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        }))
      );

const RootComponent = () => (
  <div className="h-screen scroll-auto flex flex-col">
    <Outlet />
    <Toaster />
    <Suspense>
      <TanStackRouterDevtools position="bottom-right" />
    </Suspense>
  </div>
);

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  beforeLoad: async ({ context: { queryClient } }) => {
    const user = await queryClient.ensureQueryData(userQuery);
    return { user };
  },
});
