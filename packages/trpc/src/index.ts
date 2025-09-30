// Client-safe exports only (no server dependencies)
export { createTRPCClient, trpc } from './client';
export type { TRPCClient } from './client';

// Type-only exports (safe for both environments)
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
