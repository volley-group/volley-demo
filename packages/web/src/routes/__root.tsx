import { Toaster } from '@/components/ui/sonner';
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
  <div className="h-screen scroll-auto flex flex-col bg-amber-50">
    <Outlet />
    <Toaster />
    <Suspense>
      <TanStackRouterDevtools position="bottom-right" />
    </Suspense>
  </div>
);

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  beforeLoad: async ({ context: { hc } }) => {
    const { userId } = await hc.userId.$get().then((r) => r.json());
    return { userId };
  },
});
