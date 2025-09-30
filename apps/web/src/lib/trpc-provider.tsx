import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import type React from 'react';
import { useState } from 'react';
import { trpc, resolveApiUrl } from '@repo/trpc';

interface TRPCProviderProps {
  children: React.ReactNode;
  apiUrl?: string;
}

export function TRPCProvider({ children, apiUrl }: TRPCProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${apiUrl || resolveApiUrl()}/api/trpc`,
          fetch: (url, options) => fetch(url, { ...options, credentials: 'include' }),
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

export { trpc };
