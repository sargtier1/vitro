# Full-Stack TypeScript Monorepo

A modern full-stack application built with TypeScript, featuring unified deployment architecture where a single Nitro server serves both the React SPA and tRPC API endpoints.

## Architecture

**Unified Deployment**: One server handles both frontend and backend, eliminating CORS issues and simplifying deployment.

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
├── api/              # Nitro API server (serves SPA + API)
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
pnpm start            # Start production server
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
pnpm test             # Run tests
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

# Development API URL (frontend proxy)
VITE_API_URL=http://localhost:3001

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Development vs Production

**Development**: Frontend (port 5173) proxies API calls to backend (port 3001)
**Production**: Single server serves both frontend and API on same port

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
| `@repo/api` | Nitro API server with unified deployment | 3001 |
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

The application uses **unified deployment** where the API server serves both the backend API and frontend static files:

```bash
# Build for production
pnpm build

# Start production server (serves both API and SPA)
pnpm start
```

**Deployment targets**:
- Vercel (recommended)
- Railway
- Netlify
- Any Node.js hosting
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

### Infrastructure
```bash
pnpm infra:setup                      # Setup infrastructure
pnpm infra:deploy                     # Deploy infrastructure
```