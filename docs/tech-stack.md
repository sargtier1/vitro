# Tech Stack

## Core Technologies

### Frontend
- **Vite + React 18** - Fast development and modern UI
- **TanStack Router** - File-based routing with type safety
- **TanStack Query** - Server state management
- **Tailwind + Shadcn/UI** - Styling and components

### Backend
- **Nitro** - Universal JavaScript server
- **tRPC** - Type-safe API layer
- **Better Auth** - Session-based authentication
- **Prisma + PostgreSQL** - Database and ORM

### Development
- **Turborepo + pnpm** - Monorepo management
- **TypeScript** - End-to-end type safety
- **Biome** - Code quality and formatting

## Architecture Patterns

### Type Safety Flow
```
Database Schema (Prisma) → API Types (tRPC) → Frontend Types (React)
```

### Monorepo Structure
- **apps/** - Frontend and backend applications
- **packages/** - Shared libraries (auth, database, UI)
- **tooling/** - Development tools and configurations

## Key Benefits

- **Full-stack type safety** from database to UI
- **Hot reload** across the entire stack
- **Shared code** between web and future mobile apps
- **Modern DX** with auto-formatting and validation
- **Production ready** with built-in auth and database