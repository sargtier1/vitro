import { getHeader, setHeader } from 'h3';
import { defineNitroPlugin } from 'nitropack/runtime';

export default defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook('beforeResponse', async (event) => {
    const origin = getHeader(event, 'origin');
    const allowedOrigins = [
      process.env.WEB_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ];

    // Apply CORS to API routes (except tRPC which handles its own CORS)
    if (event.node.req.url?.startsWith('/api/') && !event.node.req.url?.startsWith('/api/trpc')) {
      // Allow the requesting origin if it's in our allowed list
      if (origin && allowedOrigins.includes(origin)) {
        setHeader(event, 'Access-Control-Allow-Origin', origin);
      } else {
        setHeader(event, 'Access-Control-Allow-Origin', 'http://localhost:5173');
      }

      setHeader(event, 'Access-Control-Allow-Credentials', 'true');
      setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      setHeader(
        event,
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Cookie, X-Requested-With'
      );

      // Handle preflight OPTIONS requests for non-tRPC routes
      if (event.node.req.method === 'OPTIONS') {
        event.node.res.statusCode = 204;
        event.node.res.end();
        return;
      }
    }
  });
});
