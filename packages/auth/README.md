# @repo/auth

Authentication package powered by Better Auth with Prisma adapter for secure user management and session handling.

## Features

- Email & password authentication with secure hashing
- Session management with HTTP-only cookies
- User profiles with role-based access control
- Automatic session renewal (7-day expiry, 1-day refresh)
- CORS support for cross-origin authentication
- Prisma integration with PostgreSQL storage
- React hooks for frontend integration

## Installation

This package is part of the monorepo and installed automatically with:

```bash
pnpm install
```

## Environment Variables

Required environment variables in root `.env`:

```env
# Authentication
BETTER_AUTH_SECRET="your-super-secret-32-char-minimum-key"

# API Server (shared endpoint for API and Auth)
API_URL=http://localhost:3001
PORT=3001

# Frontend
VITE_API_URL=http://localhost:3001
```

## Usage

### Backend Setup

```typescript
// apps/api/src/api/auth/[...all].ts
import { auth } from '@repo/auth';

export default auth.handler;
```

### Client Usage (React)

```typescript
import { useSession, signIn, signUp, signOut } from '@repo/auth/client';

function AuthComponent() {
  const { data: session, isPending, error } = useSession();
  
  const handleSignIn = async () => {
    const result = await signIn.email({
      email: 'user@example.com',
      password: 'password123'
    });
    
    if (result.error) {
      console.error('Sign in failed:', result.error.message);
    }
  };

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {session?.user ? (
        <div>
          <p>Welcome, {session.user.email}!</p>
          <button onClick={() => signOut()}>Sign Out</button>
        </div>
      ) : (
        <button onClick={handleSignIn}>Sign In</button>
      )}
    </div>
  );
}
```

### tRPC Integration

```typescript
// packages/trpc/src/context.ts
import { auth } from '@repo/auth';

export const createContext = async (opts: CreateNextContextOptions) => {
  const session = await auth.api.getSession({ headers: opts.req.headers });
  
  return {
    session,
    user: session?.user,
  };
};

// Protected procedure example
export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});
```

## Database Schema

Better Auth automatically uses these Prisma models:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  accounts Account[]
  sessions Session[]
  posts    Post[]
}

model Account {
  id                String @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Session {
  id        String   @id @default(cuid())
  sessionToken String @unique
  userId    String
  expires   DateTime
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Available Methods

### Client Methods

```typescript
import { 
  useSession,      // React hook for current session
  signIn,          // Sign in methods
  signUp,          // Sign up methods  
  signOut,         // Sign out method
  updateUser,      // Update user profile
} from '@repo/auth/client';

// Usage examples
const { data: session, isPending, error } = useSession();

await signIn.email({ email: 'user@example.com', password: 'pass123' });
await signUp.email({ email: 'new@example.com', password: 'pass123', name: 'John' });
await signOut();
await updateUser({ name: 'New Name' });
```

### Server Methods

```typescript
import { auth } from '@repo/auth';

// Get session from request headers
const session = await auth.api.getSession({ headers: req.headers });

// Validate session in API routes
if (!session) {
  return new Response('Unauthorized', { status: 401 });
}

// Access user data
const user = session.user; // { id, email, name, role }
```

## Security Features

- **Password Security**: Argon2 hashing with automatic salt generation
- **Session Security**: HTTP-only cookies, secure flag in production, SameSite attribute
- **CORS Security**: Explicit allowlist of trusted origins with credentials support

## Production Setup

```env
# Production values
BETTER_AUTH_SECRET="secure-random-32-char-production-secret"
BETTER_AUTH_URL=https://api.yourdomain.com
BETTER_AUTH_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
VITE_API_URL=https://api.yourdomain.com
```

## Related Documentation

- [Better Auth Documentation](https://www.better-auth.com/)
- [Database Package](../database/README.md)
- [tRPC Package](../trpc/README.md)
