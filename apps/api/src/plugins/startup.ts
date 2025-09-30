import { serverLogger } from '@repo/logger';
import { defineNitroPlugin } from 'nitropack/runtime';

export default defineNitroPlugin(async (nitroApp) => {
  serverLogger.info('Initializing API server');

  // Log server startup - hook for server lifecycle events
  serverLogger.success('API server initialized');

  nitroApp.hooks.hook('close', () => {
    serverLogger.info('API server shutting down');
  });

  nitroApp.hooks.hook('error', (error: Error) => {
    serverLogger.error(`API server error: ${error.message}`);
  });
});
