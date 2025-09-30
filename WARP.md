# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Architecture

This is a Turborepo monorepo with a full-stack TypeScript application featuring:

- **Full-stack deployment**: Nitro-powered API server that serves both API endpoints and the built React SPA
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with session-based authentication
- **Type safety**: tRPC for end-to-end type-safe APIs
- **Frontend**: React with TanStack Router for routing
- **Styling**: TailwindCSS with Radix UI components
- **Code quality**: Biome for linting/formatting

### Repository Structure

```
apps/
├── api/           # Nitro-based API server (serves both API + SPA)
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

- **Unified deployment**: The API app builds and serves the web app's static files
- **Database**: Uses Prisma with PostgreSQL, includes Better Auth schema
- **Environment**: Supports Turbo's "loose mode" for environment variables
- **Routing**: Frontend uses TanStack Router, API uses Nitro file-based routing

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

# Start production server (unified deployment)
pnpm start            # Filtered to API (serves both API + web)
pnpm start:simple     # Simple production start
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

# Run tests
pnpm test

# Biome formatting and linting
pnpm biome:check      # Check formatting and linting
pnpm biome:fix        # Fix linting issues
pnpm biome:format     # Format code
pnpm biome:lint:fix   # Fix linting issues only
```

### Code Generation
```bash
# Run custom generators
pnpm generate
```

### Infrastructure
```bash
# Setup infrastructure
pnpm infra:setup

# Deploy infrastructure
pnpm infra:deploy
```

## Development Workflow

### Setting Up Environment
1. Copy `.env.example` to `.env.local` (or `.env.dev` for development)
2. Set database connection string and other environment variables
3. Run `pnpm db:generate` to generate Prisma client
4. Run `pnpm db:push` or `pnpm db:migrate` to setup database

### Running Individual Tests
Use Turbo filtering to run tests for specific packages:
```bash
# Test specific package
pnpm --filter @repo/database test
pnpm --filter @repo/trpc test

# Test specific app
pnpm --filter @repo/api test
pnpm --filter @repo/web test
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

## Important Notes

### tRPC Import Safety
- Use `@repo/trpc` for client-side imports (browser-safe)
- Use `@repo/trpc/server` for server-side imports (includes database dependencies)
- The separation prevents Prisma from being bundled in the frontend

### Environment Variables
- Development: Frontend proxies API calls to separate server
- Production: Single server serves both frontend and API (unified deployment)

## Package Manager

This project uses **pnpm** with workspace support. Key points:
- Package manager is locked to `pnpm@10.15.0`
- Uses a catalog system for dependency version management
- Workspace filtering is used extensively for running commands on specific packages
