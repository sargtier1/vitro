import { getHeader, setHeader } from 'h3';
import { defineNitroPlugin } from 'nitropack/runtime';

export default defineNitroPlugin(async (nitroApp) => {
  // Handle OPTIONS preflight requests first
  nitroApp.hooks.hook('request', async (event) => {
    if (event.node.req.method === 'OPTIONS' && event.node.req.url?.startsWith('/api/')) {
      const origin = getHeader(event, 'origin');
      
      // Get allowed origins from environment or use defaults
      const corsOrigins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || [];
      const allowedOrigins = [
        ...corsOrigins,
        'http://localhost:5173', // Development frontend
        'http://localhost:3001', // Development API
        'http://*********:5173',
      ];

      // Set CORS headers for OPTIONS preflight
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
      setHeader(event, 'Access-Control-Max-Age', 86400); // 24 hours

      event.node.res.statusCode = 204;
      event.node.res.end();
      return;
    }
  });

  // Set CORS headers for all API responses
  nitroApp.hooks.hook('beforeResponse', async (event) => {
    if (event.node.req.url?.startsWith('/api/')) {
      const origin = getHeader(event, 'origin');
      
      // Get allowed origins from environment or use defaults
      const corsOrigins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || [];
      const allowedOrigins = [
        ...corsOrigins,
        'http://localhost:5173', // Development frontend
        'http://localhost:3001', // Development API
        'http://*********:5173',
      ];

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
    }
  });
});