import type { ApiRoutes } from '@braid/functions/api';
import { QueryClient } from '@tanstack/react-query';
import { hc as honoClient } from 'hono/client';
// import { createTRPCProxyClient, CreateTRPCClientOptions, createTRPCReact, httpBatchLink } from '@trpc/react-query';

export const queryClient = new QueryClient();

const serverUrl = import.meta.env.VITE_API_URL;
const apiUrl = serverUrl ? `${serverUrl}/api` : '/api';
// const trpcUrl = serverUrl ? `${serverUrl}/trpc` : '/trpc';

export const hc = honoClient<ApiRoutes>(apiUrl, {
  init: {
    credentials: 'include',
    redirect: 'manual',
  },
});

// const trpcConfig: CreateTRPCClientOptions<TrpcRoutes> = {
//   links: [
//     httpBatchLink({
//       url: `${window.location.origin}/trpc`,
//     }),
//   ],
// };
// export const tsrpc = createTRPCProxyClient<TrpcRoutes>(trpcConfig);
// export const rtrpc = createTRPCReact<TrpcRoutes>();
// export type TrpcApi = typeof tsrpc;
