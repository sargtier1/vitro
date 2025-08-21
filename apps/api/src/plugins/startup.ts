import { serverLogger } from '@repo/logger';
import { defineNitroPlugin } from 'nitropack/runtime';

export default defineNitroPlugin(async (nitroApp) => {
  serverLogger.info('Initializing API server');

  nitroApp.hooks.hook('listen', (server) => {
    const address = server.address();
    if (address && typeof address === 'object') {
      const { port, address: host } = address;
      serverLogger.success(`API server ready on http://${host}:${port}`);
    } else {
      serverLogger.success('API server ready');
    }
  });

  nitroApp.hooks.hook('close', () => {
    serverLogger.info('API server shutting down');
  });

  nitroApp.hooks.hook('error', (error) => {
    serverLogger.error(`API server error: ${error.message}`);
  });
});
