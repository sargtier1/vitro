# @repo/web

Frontend web application built with Vite, React, TypeScript, and Tailwind CSS. Includes tRPC integration for type-safe API calls and Better Auth for authentication.

## Features

- Vite - Fast development server and build tool
- React 18 - Modern React with concurrent features
- TypeScript - Full type safety throughout the application
- Tailwind CSS - Utility-first CSS framework
- tRPC Integration - Type-safe API calls with React Query
- Better Auth - Authentication with session management
- Shadcn/UI Components - Consistent UI component library
- Hot Module Replacement - Instant updates during development

## Installation

This package is part of the monorepo and installed automatically with:

```bash
pnpm install
```

## Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm type-check

# Lint code
pnpm lint
pnpm lint:fix
```

## Environment Variables

Environment variables in root `.env`:

```env
# API Configuration (only required for development)
# In production, frontend and backend share the same origin
VITE_API_URL=http://localhost:3001

# Development
NODE_ENV=development
```

**Note**: In the unified deployment architecture, `VITE_API_URL` is only needed during development for proxying API requests. In production, the frontend automatically uses the same origin as the backend since they're served together.

## Project Structure

```
apps/web/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── lib/           # Utilities and configurations
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript type definitions
│   └── main.tsx       # Application entry point
├── public/            # Static assets
├── index.html         # HTML template
├── vite.config.ts     # Vite configuration
└── tailwind.config.js # Tailwind CSS configuration
```

## Usage

### tRPC Integration

```typescript
import { trpc } from '@/lib/trpc';

function UserProfile() {
  const { data: user, isLoading } = trpc.users.profile.useQuery();
  const updateUser = trpc.users.update.useMutation();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={() => updateUser.mutate({ name: 'New Name' })}>
        Update Name
      </button>
    </div>
  );
}
```

### Authentication

```typescript
import { useSession, signIn, signOut } from '@repo/auth/client';

function AuthComponent() {
  const { data: session, isPending } = useSession();
  
  if (isPending) return <div>Loading...</div>;
  
  return (
    <div>
      {session?.user ? (
        <div>
          <p>Welcome, {session.user.email}</p>
          <button onClick={() => signOut()}>Sign Out</button>
        </div>
      ) : (
        <button onClick={() => signIn.email({
          email: 'user@example.com',
          password: 'password123'
        })}>
          Sign In
        </button>
      )}
    </div>
  );
}
```

### UI Components

```typescript
import { Button, Card, CardContent, CardHeader, CardTitle } from '@repo/ui';

function Dashboard() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Button>Get Started</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Configuration

### Vite Configuration

The web app uses a custom Vite configuration optimized for:
- TypeScript support
- Path aliases (`@/` for src directory)
- Environment variable handling
- Build optimization
- Development server proxy

### Tailwind Configuration

Extends the shared UI package configuration with:
- Custom color scheme
- Typography defaults
- Component utilities
- Responsive breakpoints

## Build Process

### Development Build
- Fast HMR with Vite
- Source maps for debugging
- Development-optimized React transforms
- Proxy to API server

### Production Build
- Optimized bundle with tree-shaking
- Code splitting for better caching
- Minified CSS and JavaScript
- Asset optimization and compression

## Deployment

This web app uses **unified deployment** - it's bundled and served by the API server rather than deployed separately.

### Development Build
```bash
# Build web app for development testing
pnpm build

# Output directory: dist/
```

### Production Deployment
The web app is built and then served by the API server:

```bash
# Build web app for production
pnpm build

# Output: dist/ (static files served by API server)
```

### Deployment Architecture
- **Development**: Frontend runs on port 5173, API on 3001 (with proxy)
- **Production**: Single server serves both frontend and API on same port
- **API Routes**: Available at `/api/*`
- **Frontend Routes**: All other routes serve the React SPA

## Related Documentation

- [tRPC Package](../../packages/trpc/README.md)
- [Auth Package](../../packages/auth/README.md)
- [UI Package](../../packages/ui/README.md)
- [API App](../api/README.md)