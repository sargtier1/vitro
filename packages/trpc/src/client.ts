import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from './routers';
import { resolveApiUrl } from './types';

// Vanilla tRPC client
export function createTRPCClient(apiUrl?: string) {
  return createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${apiUrl || resolveApiUrl()}/api/trpc`,
        fetch: (url, options) => fetch(url, { ...options, credentials: 'include' }),
      }),
    ],
  });
}

// tRPC React hooks (for React apps)
export const trpc = createTRPCReact<AppRouter>();

// Types
export type TRPCClient = ReturnType<typeof createTRPCClient>;
