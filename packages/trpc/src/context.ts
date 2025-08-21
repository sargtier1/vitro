import { prisma } from '@repo/database';
import { apiLogger } from '@repo/logger';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export async function createContext({ req }: FetchCreateContextFnOptions) {
  let session = null;
  let user = null;
  const authDebug = {
    authImported: false,
    hasApiMethod: false,
    hasGetSession: false,
    sessionResult: null as unknown,
    error: null as string | null,
    headers: {} as Record<string, string>,
  };

  try {
    // Extract headers for debugging
    const headerEntries = Array.from(req.headers.entries());
    authDebug.headers = Object.fromEntries(headerEntries);

    // Dynamically import auth to avoid bundling issues
    const { auth } = await import('@repo/auth');
    authDebug.authImported = !!auth;
    authDebug.hasApiMethod = !!(auth?.api);
    authDebug.hasGetSession = !!(auth?.api?.getSession);

    if (auth?.api?.getSession) {
      apiLogger.debug('Creating tRPC context with auth session');
      session = await auth.api.getSession({
        headers: req.headers,
      });

      authDebug.sessionResult = session;
      user = session?.user || null;

      if (user) {
        apiLogger.debug(`tRPC context created for user: ${user.id}`);
      } else {
        apiLogger.debug('tRPC context created without authenticated user');
      }
    }
  } catch (error) {
    authDebug.error = error instanceof Error ? error.message : String(error);
    apiLogger.warn(`tRPC context creation error: ${authDebug.error}`);
    // Continue without auth - health endpoints don't require it
  }

  const context = {
    req,
    session,
    user,
    prisma,
  };

  return context;
}

export type Context = Awaited<ReturnType<typeof createContext>>;
