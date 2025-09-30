import { prisma } from '@repo/database';
import { apiLogger } from '@repo/logger';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export async function createContext({ req }: FetchCreateContextFnOptions) {
  let session = null;
  let user = null;

  try {
    // Dynamically import auth to avoid bundling issues
    const { auth } = await import('@repo/auth');
    
    if (auth?.api?.getSession) {
      session = await auth.api.getSession({
        headers: req.headers,
      });
      
      user = session?.user || null;
    }
  } catch (error) {
    // Log error but continue without auth - some endpoints don't require it
    apiLogger.warn(`Auth context creation failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return {
    req,
    session,
    user,
    prisma,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
