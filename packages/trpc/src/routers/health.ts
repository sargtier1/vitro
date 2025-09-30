import { createTRPCRouter, publicProcedure } from '../server';

export const healthRouter = createTRPCRouter({
  // Simple health check - no auth required
  status: publicProcedure.query(async ({ ctx }) => {
    const startTime = Date.now();
    
    // Database check
    let dbConnected = false;
    try {
      await ctx.prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
    } catch {
      dbConnected = false;
    }

    // Environment check
    const hasRequiredEnv = !!
      (process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET);

    // Auth check
    let authConfigured = false;
    try {
      const { auth } = await import('@repo/auth');
      authConfigured = !!(auth && typeof auth === 'object');
    } catch {
      authConfigured = false;
    }

    const isHealthy = dbConnected && hasRequiredEnv && authConfigured;
    const responseTime = Date.now() - startTime;

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime,
      checks: {
        database: dbConnected,
        environment: hasRequiredEnv,
        auth: authConfigured,
      },
    };
  }),
});
