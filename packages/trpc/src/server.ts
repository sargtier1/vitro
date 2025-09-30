import { TRPCError, initTRPC } from '@trpc/server';
import { apiLogger } from '@repo/logger';
import type { Context } from './context';
import { UserRole, type UserWithRole } from './types';

const t = initTRPC.context<Context>().create();

// Logging middleware for query execution timing and metadata
const loggingMiddleware = t.middleware(async ({ path, type, next, ctx }) => {
  const startTime = Date.now();
  const userInfo = ctx.user ? `user:${ctx.user.id}` : 'anonymous';

  apiLogger.debug(`Starting ${type} procedure: ${path} (${userInfo})`);

  try {
    const result = await next();
    const duration = Date.now() - startTime;

    apiLogger.info(`Completed ${type} procedure: ${path} (${duration}ms) (${userInfo})`);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    apiLogger.error(
      `Failed ${type} procedure: ${path} (${duration}ms) (${userInfo}) - ${errorMessage}`
    );

    throw error;
  }
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure.use(loggingMiddleware);

// Auth guard middleware - requires valid session
const authGuard = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    apiLogger.warn('Unauthorized access attempt - session or user missing');
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  apiLogger.debug(`Authenticated request for user: ${ctx.user.id}`);
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.user,
    },
  });
});

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(loggingMiddleware).use(authGuard);

// Admin guard middleware - requires admin role
const adminGuard = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.user) {
    apiLogger.warn('Admin access attempt without authentication');
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  const userWithRole = ctx.user as UserWithRole;
  if (userWithRole.role !== UserRole.ADMIN) {
    apiLogger.warn(`Non-admin user ${ctx.user.id} attempted admin access`);
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
  apiLogger.debug(`Admin access granted for user: ${ctx.user.id}`);
  return next({ ctx });
});

// Admin procedure that requires admin role
export const adminProcedure = t.procedure.use(loggingMiddleware).use(authGuard).use(adminGuard);
