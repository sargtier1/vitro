import { createTRPCRouter, publicProcedure } from '../server';

export const healthRouter = createTRPCRouter({
  // Public health check - no auth required
  status: publicProcedure.query(async ({ ctx }) => {
    const startTime = Date.now();

    // Environment Variables Check
    const requiredEnvs = ['DATABASE_URL', 'BETTER_AUTH_SECRET', 'BETTER_AUTH_URL', 'NODE_ENV'];

    const envStatus = requiredEnvs.reduce(
      (acc, env) => {
        acc[env] = {
          exists: !!process.env[env],
          value: process.env[env] ? '[REDACTED]' : null,
        };
        return acc;
      },
      {} as Record<string, { exists: boolean; value: string | null }>
    );

    // Database Connectivity Check
    let dbStatus = {
      connected: false,
      error: null as string | null,
      responseTime: null as number | null,
    };

    try {
      const dbStart = Date.now();
      await ctx.prisma.$queryRaw`SELECT 1 as test`;
      dbStatus = {
        connected: true,
        error: null,
        responseTime: Date.now() - dbStart,
      };
    } catch (error: unknown) {
      dbStatus = {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown database error',
        responseTime: null,
      };
    }

    // Better Auth Status Check
    let authStatus = {
      configured: false,
      error: null as string | null,
      hasSecret: !!process.env.BETTER_AUTH_SECRET,
      hasUrl: !!process.env.BETTER_AUTH_URL,
    };

    try {
      // Dynamically check auth configuration
      const { auth } = await import('@repo/auth');
      authStatus = {
        configured: !!(auth && typeof auth === 'object'),
        error: null,
        hasSecret: !!process.env.BETTER_AUTH_SECRET,
        hasUrl: !!process.env.BETTER_AUTH_URL,
      };
    } catch (error: unknown) {
      authStatus = {
        configured: false,
        error: error instanceof Error ? error.message : 'Auth configuration error',
        hasSecret: !!process.env.BETTER_AUTH_SECRET,
        hasUrl: !!process.env.BETTER_AUTH_URL,
      };
    }

    // System Information
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        external: Math.round((process.memoryUsage().external / 1024 / 1024) * 100) / 100,
      },
    };

    // Overall Health Status
    const isHealthy =
      dbStatus.connected &&
      authStatus.configured &&
      envStatus.DATABASE_URL.exists &&
      envStatus.BETTER_AUTH_SECRET.exists;

    const responseTime = Date.now() - startTime;

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime,
      services: {
        database: dbStatus,
        auth: authStatus,
        environment: {
          nodeEnv: process.env.NODE_ENV || 'unknown',
          variables: envStatus,
          allPresent: Object.values(envStatus).every((env) => env.exists),
        },
        system: systemInfo,
      },
      summary: {
        healthy: isHealthy,
        issues: [
          ...(dbStatus.connected ? [] : ['Database not connected']),
          ...(authStatus.configured ? [] : ['Auth not configured']),
          ...(envStatus.DATABASE_URL.exists ? [] : ['DATABASE_URL missing']),
          ...(envStatus.BETTER_AUTH_SECRET.exists ? [] : ['BETTER_AUTH_SECRET missing']),
        ],
      },
    };
  }),

  // Detailed database health check
  database: publicProcedure.query(async ({ ctx }) => {
    const checks = [];

    try {
      // Basic connectivity
      const startTime = Date.now();
      await ctx.prisma.$queryRaw`SELECT 1 as test`;
      checks.push({
        name: 'Basic Connectivity',
        status: 'pass',
        responseTime: Date.now() - startTime,
        message: 'Database is reachable',
      });

      // Check if tables exist
      try {
        const userCount = await ctx.prisma.user.count();
        checks.push({
          name: 'User Table',
          status: 'pass',
          count: userCount,
          message: `Found ${userCount} users`,
        });
      } catch (error: unknown) {
        checks.push({
          name: 'User Table',
          status: 'fail',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      try {
        const postCount = await ctx.prisma.post.count();
        checks.push({
          name: 'Post Table',
          status: 'pass',
          count: postCount,
          message: `Found ${postCount} posts`,
        });
      } catch (error: unknown) {
        checks.push({
          name: 'Post Table',
          status: 'fail',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    } catch (error: unknown) {
      checks.push({
        name: 'Basic Connectivity',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    const allPassed = checks.every((check) => check.status === 'pass');

    return {
      status: allPassed ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
      summary: {
        total: checks.length,
        passed: checks.filter((c) => c.status === 'pass').length,
        failed: checks.filter((c) => c.status === 'fail').length,
      },
    };
  }),

  // Environment variables check
  environment: publicProcedure.query(async () => {
    const envGroups = {
      database: ['DATABASE_URL'],
      auth: ['BETTER_AUTH_SECRET', 'BETTER_AUTH_URL', 'BETTER_AUTH_TRUSTED_ORIGINS'],
      application: ['NODE_ENV', 'NITRO_PORT', 'WEB_URL'],
    };

    const results = Object.entries(envGroups).reduce(
      (acc, [group, vars]) => {
        acc[group] = vars.map((varName) => ({
          name: varName,
          exists: !!process.env[varName],
          value: process.env[varName]
            ? varName.toLowerCase().includes('secret') || varName.toLowerCase().includes('url')
              ? '[REDACTED]'
              : process.env[varName]
            : null,
        }));
        return acc;
      },
      {} as Record<string, Array<{ name: string; exists: boolean; value: string | null }>>
    );

    const totalVars = Object.values(envGroups).flat().length;
    const existingVars = Object.values(results)
      .flat()
      .filter((env) => env.exists).length;

    return {
      status: existingVars === totalVars ? 'complete' : 'incomplete',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      variables: results,
      summary: {
        total: totalVars,
        existing: existingVars,
        missing: totalVars - existingVars,
        completeness: Math.round((existingVars / totalVars) * 100),
      },
    };
  }),
});
