import { useSession } from '@repo/auth/client';
import { useEffect, useState } from 'react';

export interface RouterContext {
  auth: {
    isAuthenticated: boolean;
    user: any;
    isLoading: boolean;
  };
}

export function useRouterContext(): RouterContext {
  const session = useSession();
  const [hasInitialized, setHasInitialized] = useState(false);

  // Stop loading after a reasonable time or when we get a response
  useEffect(() => {
    if (!session.isPending || session.data !== undefined || session.error) {
      setHasInitialized(true);
    }
  }, [session.isPending, session.data, session.error]);

  // Force initialization after 3 seconds to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      setHasInitialized(true);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return {
    auth: {
      isAuthenticated: !!session.data?.user,
      user: session.data?.user || null,
      isLoading: !hasInitialized && session.isPending,
    },
  };
}
