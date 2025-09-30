# Full-Stack TypeScript Monorepo

A modern full-stack application built with TypeScript, featuring independent deployment architecture where the React SPA and Nitro API server are deployed separately.

## Architecture

**Independent Deployments**: Frontend and API are deployed separately to different services, with CORS configuration enabling cross-origin communication.

- **Backend**: Nitro server with tRPC for type-safe APIs
- **Frontend**: React SPA with TanStack Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth with session-based security
- **Styling**: TailwindCSS with Radix UI components
- **Code Quality**: Biome for linting and formatting

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local

# Generate database client
pnpm db:generate

# Setup database
pnpm db:push

# Start development
pnpm dev
```

## Project Structure

```
apps/
├── api/              # Nitro API server
└── web/              # React frontend application

packages/
├── auth/             # Better Auth configuration
├── database/         # Prisma schema and client  
├── logger/           # Structured logging utilities
├── trpc/             # tRPC router and type definitions
└── ui/               # Shared UI components (Shadcn/UI)

tooling/
├── biome/            # Code formatting and linting config
├── generator/        # Package scaffolding tool
└── tsconfig/         # Shared TypeScript configurations
```

## Development Commands

### Core Development
```bash
pnpm dev              # Start all apps in development
pnpm dev:api          # API server only (port 3001)
pnpm dev:web          # Frontend only (port 5173)
pnpm build            # Build all apps for production

# Build individual apps
pnpm --filter @repo/api build    # Build API server only
pnpm --filter @repo/web build    # Build frontend only

# Start production servers
pnpm --filter @repo/api start    # Start API server
pnpm --filter @repo/web preview  # Preview built frontend
```

### Database Operations
```bash
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database (dev)
pnpm db:migrate       # Create migration (prod)
pnpm db:studio        # Open Prisma Studio GUI
pnpm db:reset         # Reset database
```

### Code Quality
```bash
pnpm lint             # Lint all packages
pnpm type-check       # TypeScript type checking
# pnpm test             # Run tests (not yet implemented)
pnpm biome:check      # Check formatting/linting
pnpm biome:fix        # Fix formatting/linting issues
```

## Environment Setup

### Required Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"

# Authentication
BETTER_AUTH_SECRET="your-32-char-secret-key-here"

# API URL for frontend (both dev and production)
VITE_API_URL=http://localhost:3001

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Development vs Production

**Development**: Frontend (port 5173) proxies API calls to backend (port 3001)
**Production**: Frontend and API deployed independently with CORS configuration

## Key Features

### Type Safety
- End-to-end type safety with tRPC
- Shared types between frontend and backend
- Runtime validation with ArkType schemas

### Authentication
- Session-based authentication with Better Auth
- HTTP-only secure cookies
- Role-based access control
- Automatic session renewal

### Database
- PostgreSQL with Prisma ORM
- Type-safe database operations
- Automatic migration system
- Better Auth compatible schema

### UI Components
- Shadcn/UI component library
- Radix UI primitives for accessibility
- TailwindCSS for styling
- Dark mode ready

## Package Details

### Apps

| Package | Description | Port |
|---------|-------------|------|
|| `@repo/api` | Nitro API server | 3001 |
| `@repo/web` | React SPA with TanStack Router | 5173 |

### Packages

| Package | Description |
|---------|-------------|
| `@repo/auth` | Better Auth configuration and React hooks |
| `@repo/database` | Prisma schema, client, and database utilities |
| `@repo/logger` | Structured logging with environment detection |
| `@repo/trpc` | tRPC router, procedures, and client setup |
| `@repo/ui` | Shared UI components with Shadcn/UI |

### Tooling

| Package | Description |
|---------|-------------|
| `@repo/biome-config` | Code formatting and linting configuration |
| `@repo/generator` | Interactive package scaffolding tool |
| `@repo/tsconfig` | Shared TypeScript configurations |

## Deployment

### Independent Deployment Strategy

The frontend and API are deployed separately:

**Frontend (React SPA)**:
```bash
# Build frontend
pnpm --filter @repo/web build
# Deploy to static hosting (Vercel, Netlify, etc.)
# Set VITE_API_URL to API domain
```

**API (Nitro Server)**:
```bash
# Build API
pnpm --filter @repo/api build
# Deploy to Node.js hosting (Railway, Render, etc.)
# Set CORS_ORIGINS to include frontend domain
```

**Frontend hosting options**:
- Vercel, Netlify, Cloudflare Pages (static hosting)
- Any CDN or static file hosting

**API hosting options**:
- Railway, Render, Heroku (Node.js hosting)
- Vercel, Netlify Functions (serverless)
- Docker containers

## Tech Stack

- **Runtime**: Node.js 18+
- **Package Manager**: pnpm 10.15.0 (required)
- **Framework**: Nitro (universal server)
- **Frontend**: React 18 + TypeScript
- **Routing**: TanStack Router (frontend), file-based (API)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Better Auth
- **API**: tRPC with ArkType validation
- **Styling**: TailwindCSS + Shadcn/UI
- **Code Quality**: Biome
- **Build System**: Turbo (monorepo orchestration)

## Scripts Reference

### Workspace Management
```bash
pnpm --filter @repo/api <command>     # Target specific app
pnpm --filter @repo/web <command>     # Target frontend
pnpm generate                         # Scaffold new packages
```

### Database Management
```bash
pnpm db:studio                        # Visual database editor
pnpm db:seed                          # Populate with sample data
pnpm db:deploy                        # Deploy migrations to production
```

