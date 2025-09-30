import { appRouter, createContext } from '@repo/trpc/server';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import {
  defineEventHandler,
  getHeaders,
  getMethod,
  getRequestURL,
  readBody,
} from 'h3';
import { requireAuth } from '../../utils/require-auth';

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);

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
    createContext: ({ req, resHeaders, info }) => {
      return createContext({ req, resHeaders, info } as any);
    },
  });
});
