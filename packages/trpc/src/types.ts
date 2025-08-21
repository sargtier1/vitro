// Type-only exports for client-side usage
// This file should not import any server-side dependencies

import type { appRouter } from './routers';

export type AppRouter = typeof appRouter;
