import { auth } from '@repo/auth';
import { type EventHandler, type H3Event, createError } from 'h3';

/**
 * Middleware used to require authentication for a route.
 *
 * Can be extended to check for specific roles or permissions.
 */
export const requireAuth: EventHandler = async (event: H3Event) => {
  const headers = event.headers;

  const session = await auth.api.getSession({
    headers: headers,
  });
  if (!session)
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  // You can save the session to the event context for later use
  event.context.auth = session;
};
