import { Toaster } from '@/components/ui/sonner';
import { hc } from '@/lib/clients';
import { RouterContext } from '@/lib/router';
import { queryOptions } from '@tanstack/react-query';
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

const userIdQuery = queryOptions({
  queryKey: ['userId'],
  queryFn: () => hc['userId'].$get().then((r) => r.json()),
});

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  beforeLoad: async ({ context: { queryClient } }) => {
    return await queryClient.ensureQueryData(userIdQuery);
  },
});
