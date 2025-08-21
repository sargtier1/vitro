import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './routers';

export function createTRPCClient(baseUrl: string) {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${baseUrl}/api/trpc`,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: 'include', // Important for Better Auth session cookies
          });
        },
      }),
    ],
  });
}

export type TRPCClient = ReturnType<typeof createTRPCClient>;
