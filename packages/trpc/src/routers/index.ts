import { createTRPCRouter } from '../server';
import { healthRouter } from './health';
import { postsRouter } from './posts';
import { usersRouter } from './users';

export const appRouter = createTRPCRouter({
  health: healthRouter,
  users: usersRouter,
  posts: postsRouter,
});

export type AppRouter = typeof appRouter;
