import { auth } from '@repo/auth';
import { toWebRequest } from 'h3';

export default defineEventHandler(async (event) => {
  // Convert H3 event to Web Request for Better Auth
  const request = toWebRequest(event);

  // Let Better Auth handle all auth routes
  return auth.handler(request);
});
