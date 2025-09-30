# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Architecture

This is a Turborepo monorepo with independent frontend and API deployments featuring:

- **Independent deployments**: Separate React SPA and Nitro API server deployments
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with session-based authentication
- **Type safety**: tRPC for end-to-end type-safe APIs
- **Frontend**: React with TanStack Router for routing
- **Styling**: TailwindCSS with Radix UI components
- **Code quality**: Biome for linting/formatting

### Repository Structure

```
apps/
├── api/           # Nitro-based API server
└── web/           # React frontend app

packages/          # Shared packages
├── auth/          # Better Auth configuration
├── database/      # Prisma schema and client
├── logger/        # Logging utilities
├── trpc/          # tRPC router and type definitions
└── ui/            # Shared UI components (TailwindCSS + Radix)

tooling/           # Development tools
├── biome/         # Code formatting and linting config
├── generator/     # Code generation utilities
└── tsconfig/      # Shared TypeScript configs
```

### Key Technical Details

- **Independent deployments**: Frontend and API are deployed separately to different services/domains
- **Database**: Uses Prisma with PostgreSQL, includes Better Auth schema
- **Environment**: Supports Turbo's "loose mode" for environment variables
- **Routing**: Frontend uses TanStack Router, API uses Nitro file-based routing
- **CORS**: Configured for cross-origin requests between frontend and API

## Common Commands

### Development
```bash
# Start all apps in development mode
pnpm dev

# Start development with verbose logging
pnpm dev:verbose

# Start individual apps
pnpm dev:api          # API server only
pnpm dev:web          # Frontend only
```

### Building and Production
```bash
# Build all apps
pnpm build

# Build individual apps
pnpm --filter @repo/api build    # Build API server only
pnpm --filter @repo/web build    # Build frontend only

# Start production servers
pnpm --filter @repo/api start    # Start API server
pnpm --filter @repo/web preview  # Preview built frontend
```

### Database Operations
```bash
# Generate Prisma client
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Create and run migrations
pnpm db:migrate

# Deploy migrations (production)
pnpm db:deploy

# Open Prisma Studio
pnpm db:studio

# Reset database
pnpm db:reset

# Seed database
pnpm db:seed
```

### Code Quality
```bash
# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check

# Run tests (not yet implemented)
# pnpm test

# Biome formatting and linting
pnpm biome:check      # Check formatting and linting
pnpm biome:fix        # Fix linting issues
pnpm biome:format     # Format code
pnpm biome:lint:fix   # Fix linting issues only
```

### Code Generation
```bash
# Run custom generators (package scaffolding)
pnpm generate
```

## Development Workflow

### Setting Up Environment
1. Copy `.env.example` to `.env.local` (or `.env.dev` for development)
2. Set database connection string and other environment variables
3. Run `pnpm db:generate` to generate Prisma client
4. Run `pnpm db:push` or `pnpm db:migrate` to setup database

### Testing (Not Yet Implemented)
Testing setup is not yet configured. When implemented, you would use Turbo filtering:
```bash
# Test specific package (when configured)
# pnpm --filter @repo/database test
# pnpm --filter @repo/trpc test

# Test specific app (when configured)
# pnpm --filter @repo/api test
# pnpm --filter @repo/web test
```

### Working with Database
- Prisma schema is in `packages/database/prisma/schema.prisma`
- The schema includes Better Auth tables (User, Account, Session, Verification)
- Always run `pnpm db:generate` after schema changes
- Use `pnpm db:studio` for visual database browsing

### Adding New tRPC Procedures
1. Define procedures in `packages/trpc/src/`
2. Export from the app router (use `@repo/trpc/server` for server-side imports)
3. The procedures are automatically available in the frontend via the tRPC client

### Frontend Routing
- Uses TanStack Router with file-based routing
- Route generation via `pnpm --filter @repo/web routes:generate`
- Routes are defined in `apps/web/src/routes/`
- Route types are auto-generated and should not be manually edited

## Important Notes

### tRPC Import Safety
- Use `@repo/trpc` for client-side imports (browser-safe)
- Use `@repo/trpc/server` for server-side imports (includes database dependencies)
- The separation prevents Prisma from being bundled in the frontend

### Environment Variables
- **Development**: Frontend (port 5173) proxies API calls to backend (port 3001)
- **Production**: Frontend and API deployed independently with CORS configuration
- **Frontend**: Uses `VITE_API_URL` to point to API server in both dev and production
- **API**: Configured with `CORS_ORIGINS` for allowed frontend domains

## Deployment

### Independent Deployment Strategy

The frontend and API are deployed separately:

**Frontend (React SPA)**:
- Build: `pnpm --filter @repo/web build`
- Deploy to: Static hosting (Vercel, Netlify, etc.)
- Environment: Set `VITE_API_URL` to API domain

**API (Nitro Server)**:
- Build: `pnpm --filter @repo/api build` 
- Deploy to: Node.js hosting (Railway, Render, etc.)
- Environment: Set `CORS_ORIGINS` to include frontend domain

**Database**:
- PostgreSQL instance (separate from both frontend and API)
- Migrations: `pnpm db:deploy` in API deployment pipeline

## Package Manager

This project uses **pnpm** with workspace support. Key points:
- Package manager is locked to `pnpm@10.15.0`
- Uses a catalog system for dependency version management
- Workspace filtering is used extensively for running commands on specific packages

## Troubleshooting

### Database Issues
- If Prisma client is out of sync: `pnpm db:generate`
- If database schema conflicts: `pnpm db:reset` (destroys data)
- For production migrations: `pnpm db:deploy`

### Development Issues
- If types are wrong after schema changes: restart TypeScript server
- If frontend can't reach API: check `VITE_API_URL` in `.env.local`
- For CORS issues: add frontend domain to `CORS_ORIGINS` in API environment
- If authentication not working: ensure cookies/sessions work across domains
