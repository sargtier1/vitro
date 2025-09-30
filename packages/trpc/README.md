# @repo/trpc

Type-safe API layer powered by tRPC v11 with ArkType validation, Better Auth integration, and role-based access control. Includes React Web and React Native clients for cross-platform development.

## Features

- End-to-End Type Safety - Shared types between frontend and backend
- Authentication Integration - Built-in Better Auth session handling
- Role-Based Access Control - Public, protected, and admin procedures
- Runtime Validation - ArkType schema validation for inputs
- Database Integration - Direct Prisma client access
- Automatic Serialization - JSON handling with Date/BigInt support
- Error Handling - Typed errors with proper HTTP status codes
- Cross-Platform - React Web and React Native support

## Installation

This package is part of the monorepo and installed automatically with:

```bash
pnpm install
```

## Client Usage

### React Web (Vite/Next.js)

```typescript
// App setup
import { TRPCProvider } from '@repo/trpc/react';

function App() {
  return (
    <TRPCProvider
      config={{
        apiUrl: 'http://localhost:3001',
        credentials: 'include', // For cookie-based auth
        queryClientOptions: {
          staleTime: 60 * 1000, // 1 minute
        },
      }}
    >
      <YourApp />
    </TRPCProvider>
  );
}

// Component usage
import { trpc } from '@repo/trpc/react';

function UserProfile() {
  const { data: user, isLoading, error } = trpc.users.profile.useQuery();
  const updateProfile = trpc.users.update.useMutation();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={() => updateProfile.mutate({ name: 'New Name' })}>
        Update Name
      </button>
    </div>
  );
}
```

### React Native (Expo)

```typescript
// App setup
import { TRPCReactNativeProvider, createAuthHeaders } from '@repo/trpc/react-native';

function App() {
  const [authToken, setAuthToken] = useState<string>();
  
  return (
    <TRPCReactNativeProvider
      config={{
        apiUrl: 'http://localhost:3001',
        headers: createAuthHeaders(authToken), // Token-based auth for RN
        queryClientOptions: {
          staleTime: 60 * 1000,
          refetchOnWindowFocus: false, // Disable for mobile
        },
      }}
    >
      <YourApp />
    </TRPCReactNativeProvider>
  );
}

// Component usage (same API as React Web)
import { trpc } from '@repo/trpc/react-native';

function UserProfile() {
  const { data: user } = trpc.users.profile.useQuery();
  const updateProfile = trpc.users.update.useMutation();
  
  return (
    <View>
      <Text>Welcome, {user?.name}!</Text>
      <Button 
        title="Update Name"
        onPress={() => updateProfile.mutate({ name: 'New Name' })}
      />
    </View>
  );
}
```

## Server Setup

### Backend Router Setup

```typescript
// apps/api/src/api/trpc/[...trpc].ts
import { appRouter, createContext } from '@repo/trpc';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

export default defineEventHandler(async (event) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: event.node.req,
    router: appRouter,
    createContext: () => createContext({ req: event.node.req }),
  });
});
```

### Frontend API Calls

```typescript
import { trpc } from '../lib/trpc';

function UserProfile() {
  // Query - automatic caching and refetching
  const { data: user, isLoading, error } = trpc.users.profile.useQuery();
  
  // Mutation - with optimistic updates
  const updateProfile = trpc.users.update.useMutation({
    onSuccess: () => {
      // Invalidate and refetch user profile
      trpc.users.profile.invalidate();
    }
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={() => updateProfile.mutate({ name: 'New Name' })}>
        Update Name
      </button>
    </div>
  );
}
```

## Access Control Levels

### Public Procedures
No authentication required - accessible to all users:

```typescript
export const publicProcedure = t.procedure;

// Example: Health check
export const healthRouter = createTRPCRouter({
  status: publicProcedure
    .query(async ({ ctx }) => {
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: !!ctx.prisma,
      };
    }),
});
```

### Protected Procedures  
Requires valid user session:

```typescript
export const protectedProcedure = t.procedure.use(authGuard);

// Example: User profile
export const usersRouter = createTRPCRouter({
  profile: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: { id: true, name: true, email: true, role: true }
      });
    }),
});
```

### Admin Procedures
Requires user session + admin role:

```typescript
export const adminProcedure = t.procedure.use(authGuard).use(adminGuard);

// Example: User management
export const adminRouter = createTRPCRouter({
  listUsers: adminProcedure
    .query(async ({ ctx }) => {
      return ctx.prisma.user.findMany({
        select: { id: true, email: true, role: true, createdAt: true }
      });
    }),
    
  deleteUser: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.delete({
        where: { id: input.id }
      });
    }),
});
```

## Available Routers

### Health Router (`trpc.health`)

```typescript
// GET /api/trpc/health.status
trpc.health.status.useQuery()
// Returns: { status: string, timestamp: string, database: boolean }
```

### Users Router (`trpc.users`)

```typescript
// Get current user profile (protected)
trpc.users.profile.useQuery()

// Update current user (protected) 
trpc.users.update.useMutation()
// Input: { name?: string, email?: string }
```

### Posts Router (`trpc.posts`)

```typescript
// List posts (public)
trpc.posts.list.useQuery({ 
  limit?: number, 
  published?: boolean 
})

// Get single post (public)
trpc.posts.byId.useQuery({ id: string })

// Create post (protected)
trpc.posts.create.useMutation()
// Input: { title: string, content: string, published?: boolean }

// Update post (protected - own posts only)
trpc.posts.update.useMutation()
// Input: { id: string, title?: string, content?: string, published?: boolean }

// Delete post (protected - own posts only) 
trpc.posts.delete.useMutation()
// Input: { id: string }
```

## Input Validation

Using ArkType for runtime validation:

```typescript
import { type } from 'arktype';

// Define validation schema
const createPostInput = type({
  title: 'string>0',           // Non-empty string
  content: 'string>10',        // At least 10 characters
  'published?': 'boolean',     // Optional boolean
});

// Use in procedure
export const postsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createPostInput.assert) // Runtime validation
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.post.create({
        data: {
          ...input,
          authorId: ctx.user.id,
        }
      });
    }),
});
```

### Common Validation Patterns

```typescript
import { type } from 'arktype';

// String validation
const emailInput = type('string.email');
const nameInput = type('string>0<100');       // 1-99 characters
const slugInput = type('string.slug');        // URL-safe string

// Number validation
const idInput = type('string.cuid');          // Prisma CUID
const pageInput = type('number>0<=100');      // Pagination limit
const ageInput = type('number>=18<=120');     // Age range

// Object validation
const userInput = type({
  email: 'string.email',
  name: 'string>0<50',
  'role?': "'user'|'admin'",                  // Enum with optional
});

// Array validation
const tagsInput = type('string[]<10');        // Max 10 tags
const idsInput = type('string.cuid[]>0');     // Non-empty ID array
```

## Error Handling

### Built-in Error Types

```typescript
import { TRPCError } from '@trpc/server';

// Authentication required
throw new TRPCError({
  code: 'UNAUTHORIZED',
  message: 'You must be logged in'
});

// Permission denied  
throw new TRPCError({
  code: 'FORBIDDEN', 
  message: 'Admin access required'
});

// Resource not found
throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'Post not found'
});

// Invalid input
throw new TRPCError({
  code: 'BAD_REQUEST',
  message: 'Invalid email format',
  cause: validationError
});

// Server error
throw new TRPCError({
  code: 'INTERNAL_SERVER_ERROR',
  message: 'Database connection failed'
});
```

### Frontend Error Handling

```typescript
function PostList() {
  const { data, error, isLoading } = trpc.posts.list.useQuery();

  if (error) {
    // Error has proper typing based on tRPC error codes
    switch (error.data?.code) {
      case 'UNAUTHORIZED':
        return <div>Please log in to continue</div>;
      case 'FORBIDDEN':
        return <div>You don't have permission</div>;
      case 'NOT_FOUND':
        return <div>Posts not found</div>;
      default:
        return <div>Something went wrong: {error.message}</div>;
    }
  }

  // ... rest of component
}
```

## Context & Middleware

### Context Creation

```typescript
// packages/trpc/src/context.ts
export async function createContext({ req }: CreateContextOptions) {
  // Get session from Better Auth
  const session = await auth.api.getSession({ headers: req.headers });
  
  return {
    req,                    // Request object
    session,                // User session (or null)
    user: session?.user,    // User data (or null)  
    prisma,                 // Database client
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
```

## Related Documentation

- [tRPC Documentation](https://trpc.io/docs)
- [ArkType Documentation](https://arktype.io/)
- [Better Auth Integration](../auth/README.md)
- [Database Package](../database/README.md)