import { appRouter, createContext } from '@repo/trpc';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import {
  defineEventHandler,
  getHeader,
  getHeaders,
  getMethod,
  getRequestURL,
  readBody,
  setHeader,
} from 'h3';
import { requireAuth } from '../../utils/require-auth';

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);

  // Handle CORS preflight OPTIONS requests
  if (getMethod(event) === 'OPTIONS') {
    const origin = getHeader(event, 'origin');
    const allowedOrigins = [
      process.env.WEB_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
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
    setHeader(event, 'Access-Control-Max-Age', '86400'); // 24 hours

    return new Response(null, { status: 204 });
  }

  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: new Request(url, {
      method: getMethod(event),
      headers: getHeaders(event),
      body:
        getMethod(event) !== 'GET' && getMethod(event) !== 'HEAD'
          ? await readBody(event)
          : undefined,
    }),
    router: appRouter,
    onRequest: [requireAuth], // Auth middleware (optional)
    createContext: ({ req }) => createContext({ req }),
  });
});
