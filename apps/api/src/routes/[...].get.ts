import { readFile } from 'fs/promises';
import { resolve } from 'path';

// Fallback route to serve the SPA for any non-API routes
export default defineEventHandler(async (event) => {
  const url = getRouterParam(event, '_') || '';
  
  // Skip API routes - let them be handled by their specific handlers
  if (url.startsWith('api/')) {
    return;
  }
  
  // For all other routes, serve the index.html for SPA routing
  try {
    const indexPath = resolve(process.cwd(), '../web/dist/index.html');
    const html = await readFile(indexPath, 'utf-8');
    
    setHeader(event, 'Content-Type', 'text/html');
    return html;
  } catch (error) {
    // In development, the web app might not be built yet
    if (process.env.NODE_ENV === 'development') {
      setResponseStatus(event, 503);
      return 'Frontend not built. Please run `pnpm build` first.';
    }
    
    setResponseStatus(event, 404);
    return 'Page not found';
  }
});