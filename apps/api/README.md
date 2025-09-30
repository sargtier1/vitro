# @repo/api

Nitro-powered backend API server providing tRPC endpoints with type-safe database operations and authentication. In production, also serves the frontend React application as static assets for unified deployment.

## Architecture

- **Framework**: Nitro (universal JavaScript server)
- **API Layer**: tRPC for type-safe client-server communication
- **Authentication**: Better Auth integration
- **Database**: Prisma client via `@repo/database`
- **Logging**: Structured logging via `@repo/logger`

## Dependencies

- `@repo/auth` - Authentication logic and middleware
- `@repo/config` - Centralized environment configuration
- `@repo/logger` - Structured logging
- `@repo/trpc` - tRPC router definitions and types

## Configuration

Uses `@repo/config` for environment-aware settings:
- Port configuration via `env.PORT`
- CORS origins via `env.getAllowedOrigins()`
- Automatic environment detection

## Development

```bash
# Start development server
pnpm dev

# Build API only
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm type-check

# Lint code
pnpm lint
pnpm lint:fix
```

## Environment

Requires environment variables for database connection and authentication. See root `.env.example` for required variables.

## Deployment

### Unified Deployment (Production)

The API server is configured for unified deployment, serving both API endpoints and frontend static assets:

- **API Routes**: Available at `/api/*` paths
- **Frontend**: Served for all other routes (SPA routing)
- **Static Assets**: Frontend build assets served with optimal caching

### Build Process

```bash
# Build API server
pnpm build

# Output: apps/api/.output/
# - server/ (API server)
# - public/ (frontend static assets)
```

### Deployment Targets

The unified build is compatible with:
- **Vercel** (recommended, auto-configured)
- **Netlify** 
- **Railway**
- **Any Node.js hosting** (manual deployment)
- **Docker containers**
