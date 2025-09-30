// Server-only exports (includes database dependencies)
export { createContext } from './context';
export { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from './server';
export { appRouter } from './routers';

// Re-export Context type for server usage
export type { Context } from './context';

// Re-export all client types for server usage
export type { 
  AppRouter,
  UserRole,
  UserWithRole,
  HealthCheckResponse,
  Post,
  CreatePostData,
  UpdatePostData,
  UserProfile,
  UpdateProfileData,
  UserStats
} from './types';
export { UserRole as UserRoles, isBrowserEnvironment, resolveApiUrl } from './types';