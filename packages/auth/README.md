# @repo/auth 🔐

Authentication package powered by **Better Auth** with **Prisma** adapter for secure user management and session handling.

## ✨ Features

- 🔐 **Email & Password Authentication** with secure hashing
- 🍪 **Session Management** with HTTP-only cookies
- 👤 **User Profiles** with additional fields (role system)
- 🔄 **Automatic Session Renewal** (7-day expiry, 1-day refresh)
- 🌐 **CORS Support** for cross-origin authentication
- 🗃️ **Prisma Integration** with PostgreSQL storage
- ⚡ **React Hooks** for frontend integration

## 📦 Installation

This package is part of the monorepo and installed automatically with:

```bash
pnpm install
```

## 🔧 Environment Variables

Required environment variables in root `.env`:

```env
# Authentication
BETTER_AUTH_SECRET="your-super-secret-32-char-minimum-key"

# Optional (with defaults)
BETTER_AUTH_URL=http://localhost:3001                      # Backend URL
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:5173          # Frontend URL(s)
VITE_API_URL=http://localhost:3001                         # Frontend API URL
```

## 🚀 Usage

### Backend Usage

```typescript
// apps/api/src/api/auth/[...all].ts
import { auth } from '@repo/auth';

export default auth.handler;
```

### Client Usage (React)

```typescript
// Using React hooks
import { useSession, signIn, signUp, signOut } from '@repo/auth';

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

### Client Usage (Direct API)

```typescript
// Using authActions for direct API calls
import { authActions } from '@repo/auth';

// Sign in
const result = await authActions.signIn({
  email: 'user@example.com',
  password: 'password123'
});

if (result.error) {
  console.error('Sign in failed:', result.error.message);
} else {
  console.log('Signed in:', result.data);
}

// Sign up
const signUpResult = await authActions.signUp({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe'
});

// Get current session
const sessionResult = await authActions.getSession();
if (sessionResult.data) {
  console.log('Current user:', sessionResult.data.user);
}

// Sign out
await authActions.signOut();
```

### tRPC Protected Procedures

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

## 🔐 Authentication Flow

### Sign Up Flow
1. User submits email/password via `signUp.email()`
2. Better Auth creates user with hashed password
3. Session created and stored in database
4. HTTP-only cookie set for future requests
5. User redirected to protected area

### Sign In Flow  
1. User submits credentials via `signIn.email()`
2. Better Auth validates password against hash
3. New session created if valid
4. Cookie updated with session token
5. Frontend receives user data

### Session Management
- **7-day expiry**: Sessions automatically expire after 7 days
- **1-day refresh**: Active sessions refresh daily
- **HTTP-only cookies**: Secure, can't be accessed by JavaScript
- **CORS support**: Works across different domains

## 🗃️ Database Schema

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
  // ... other OAuth fields
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Session {
  id        String   @id @default(cuid())
  sessionToken String @unique
  userId    String
  expires   DateTime
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
}
```

## 🛠️ Available Methods

### Client Methods (`@repo/auth/client`)

```typescript
import { 
  useSession,      // React hook for current session
  signIn,          // Sign in methods
  signUp,          // Sign up methods  
  signOut,         // Sign out method
  forgetPassword,  // Password reset request
  resetPassword,   // Password reset completion
  updateUser,      // Update user profile
} from '@repo/auth/client';

// Usage examples
const { data: session, isPending, error } = useSession();

await signIn.email({ email: 'user@example.com', password: 'pass123' });
await signUp.email({ email: 'new@example.com', password: 'pass123', name: 'John' });
await signOut();
await updateUser({ name: 'New Name' });
```

### Server Methods (`@repo/auth`)

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

## 🔒 Security Features

### Password Security
- **Argon2 hashing**: Industry-standard password hashing
- **Salt generation**: Automatic per-password salts
- **Timing attack protection**: Consistent response times

### Session Security  
- **HTTP-only cookies**: Not accessible via JavaScript
- **Secure flag**: Only sent over HTTPS in production
- **SameSite attribute**: CSRF protection
- **Session rotation**: New session ID on auth changes

### CORS Security
- **Trusted origins**: Explicit allowlist of frontend URLs
- **Credentials support**: Secure cross-origin cookie handling
- **Preflight handling**: Proper OPTIONS request handling

## 🧪 Testing

### Testing Authenticated Routes

```typescript
// Test helper for authenticated requests
export const createAuthenticatedContext = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const session = await prisma.session.create({
    data: {
      userId,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      sessionToken: crypto.randomUUID(),
    },
  });
  
  return { user, session };
};
```

### Frontend Testing

```typescript
// Mock auth client for tests
const mockAuthClient = {
  useSession: () => ({
    data: { user: { id: '1', email: 'test@example.com', role: 'user' } },
    isPending: false,
  }),
  signIn: { email: vi.fn() },
  signUp: { email: vi.fn() },
  signOut: vi.fn(),
};
```

## 🔧 Customization

### Adding User Fields

```typescript
// packages/auth/src/server.ts
export const auth = betterAuth({
  // ... other config
  user: {
    additionalFields: {
      role: {
        type: 'string', 
        defaultValue: 'user',
        required: false
      },
      avatar: {
        type: 'string',
        required: false
      },
      // Add more fields as needed
    }
  },
});
```

### Custom Session Duration

```typescript
// packages/auth/src/server.ts
export const auth = betterAuth({
  // ... other config
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24 * 7,  // 7 days
  },
});
```

## 🚀 Production Setup

### Environment Variables
```env
# Production values
BETTER_AUTH_SECRET="secure-random-32-char-production-secret"
BETTER_AUTH_URL=https://api.yourdomain.com
BETTER_AUTH_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
VITE_API_URL=https://api.yourdomain.com
```

### HTTPS Requirements
- Better Auth requires HTTPS in production
- Secure cookies automatically enabled
- Set proper CORS origins for your domains

### Database Considerations
- Ensure PostgreSQL connection pooling
- Consider session cleanup for old sessions
- Monitor session table size and performance

## 🔍 Debugging

### Enable Debug Logging

```typescript
// Add to auth configuration
export const auth = betterAuth({
  // ... other config
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    disabled: false,
  },
});
```

### Common Issues

**"BETTER_AUTH_SECRET is required"**
```bash
# Ensure secret is set in .env
echo "BETTER_AUTH_SECRET=$(openssl rand -base64 32)" >> .env
```

**CORS errors**
```bash
# Check trusted origins match frontend URL
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:5173
```

**Session not persisting**
```bash
# Verify database schema is up to date
pnpm db:push
```

## 📚 Related Documentation

- **[Better Auth Documentation](https://www.better-auth.com/)** - Official Better Auth docs
- **[Database Package](../database/README.md)** - Prisma schema and operations  
- **[tRPC Package](../trpc/README.md)** - Protected API procedures
- **[Web App](../../apps/web/README.md)** - Frontend integration

## 🤝 Contributing

When adding new authentication features:

1. **Update types**: Add new fields to `AuthSession` type
2. **Update schema**: Modify Prisma schema if needed
3. **Update client**: Export new methods from client.ts
4. **Test**: Verify both frontend and backend integration
5. **Document**: Update this README with new features

---

**Built with Better Auth for secure, scalable authentication** 🔐