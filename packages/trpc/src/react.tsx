import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type React from 'react';
import { useState } from 'react';
// Import the actual router type
import type { AppRouter } from './routers';

// Create the tRPC React hooks
export const trpc: ReturnType<typeof createTRPCReact<AppRouter>> = createTRPCReact<AppRouter>();

// Client configuration options
export interface TRPCClientConfig {
  apiUrl: string;
  credentials?: RequestCredentials;
  headers?: Record<string, string>;
  queryClientOptions?: {
    staleTime?: number;
    cacheTime?: number;
    refetchOnWindowFocus?: boolean;
  };
}

// Default query client options
const defaultQueryClientOptions = {
  staleTime: 60 * 1000, // 1 minute
  cacheTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: false,
};

// Create tRPC client factory
export function createTRPCReactClient(config: TRPCClientConfig) {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${config.apiUrl}/api/trpc`,
        headers: config.headers,
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: config.credentials || 'include', // Important for Better Auth session cookies
          });
        },
      }),
    ],
  });
}

// TRPCProvider component for React web and React Native
export function TRPCProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: TRPCClientConfig;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            ...defaultQueryClientOptions,
            ...config.queryClientOptions,
          },
        },
      })
  );

  const [trpcClient] = useState(() => createTRPCReactClient(config));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

// Hook to use tRPC client outside of React Query
export function useTRPCClient(): ReturnType<typeof createTRPCReactClient> {
  return trpc.useUtils().client;
}

// Export the tRPC instance for direct use
export { trpc as api };

// Export types
export type { AppRouter } from './routers';
