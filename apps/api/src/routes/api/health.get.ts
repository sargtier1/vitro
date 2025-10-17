export default defineEventHandler(async (event) => {
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
    };

    // Optional: Add database health check
    // You can uncomment this if you want to check database connectivity
    /*
    try {
      const db = await import('@repo/database');
      await db.prisma.$queryRaw`SELECT 1`;
      health.database = 'connected';
    } catch (error) {
      health.database = 'disconnected';
      health.status = 'degraded';
    }
    */

    setResponseStatus(event, 200);
    return health;
  } catch (error) {
    setResponseStatus(event, 503);
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
});