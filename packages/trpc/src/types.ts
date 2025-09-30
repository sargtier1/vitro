// Re-export AppRouter for consistent usage
export type { AppRouter } from './routers';

// Context types for external consumption
export type { Context } from './context';

// Browser environment detection interface
interface WindowWithLocation {
  location: {
    origin: string;
  };
  process?: {
    env?: Record<string, string | undefined>;
  };
}

interface GlobalWithWindow {
  window?: WindowWithLocation;
  VITE_API_URL?: string;
  document?: unknown;
}

// Type-safe browser detection
export function isBrowserEnvironment(): boolean {
  return (
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as GlobalWithWindow).window !== 'undefined' &&
    typeof (globalThis as GlobalWithWindow).document !== 'undefined'
  );
}

// Type-safe API URL resolution
export function resolveApiUrl(): string {
  if (isBrowserEnvironment()) {
    const global = globalThis as GlobalWithWindow;
    const win = global.window as WindowWithLocation;
    
    // Try to get VITE_API_URL from various sources
    const viteApiUrl = global.VITE_API_URL || win.process?.env?.VITE_API_URL;
    
    return viteApiUrl || win.location.origin;
  }
  
  // Server: use localhost
  return 'http://localhost:3001';
}

// User role enum for type safety
export const UserRole = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// Extended user type with role
export interface UserWithRole {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;
}

// Health check response type
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  responseTime: number;
  checks: {
    database: boolean;
    environment: boolean;
    auth: boolean;
  };
}

// Post types for frontend consumption
export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreatePostData {
  title: string;
  content: string;
}

export interface UpdatePostData {
  id: string;
  title?: string;
  content?: string;
}

// User profile types
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  createdAt: Date;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface UserStats {
  userId: string;
  joinedAt: Date;
  lastLogin: string;
}