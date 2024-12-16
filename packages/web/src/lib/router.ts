import { hc, queryClient } from '@/lib/clients';
import { routeTree } from '@/routeTree.gen';
import { QueryClient } from '@tanstack/react-query';
import { createRouter as createTanStackRouter } from '@tanstack/react-router';

export interface RouterContext {
  hc: typeof hc;
  queryClient: typeof queryClient;
}

export function createRouter(queryClient: QueryClient) {
  return createTanStackRouter({
    routeTree,
    context: { queryClient, hc },
    defaultPreload: 'intent',
  });
}
export type Router = ReturnType<typeof createRouter>;

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
