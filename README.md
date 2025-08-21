# Vitro 🚀

> **Vitro** = **Vite** + **Nitro** + **Turbo** - A lightning-fast full-stack TypeScript framework for micro cloud applications.

Modern full-stack monorepo with **Vite** frontend, **Nitro** backend, **Prisma** database, and **Better Auth** authentication. Built for rapid development and seamless deployment.

## ✨ Key Features

- ⚡ **Lightning Fast** - Vite HMR + Nitro auto-reload + Turbo builds
- 🔒 **End-to-End Type Safety** - TypeScript everywhere with tRPC
- 🔐 **Production-Ready Auth** - Better Auth with secure sessions
- 📊 **Dual API Architecture** - tRPC + GraphQL for maximum flexibility
- 🎨 **Modern UI Stack** - Shadcn/UI + Tailwind CSS + TanStack Router
- 🗃️ **Type-Safe Database** - Prisma ORM with PostgreSQL
- 🛠️ **Premium DX** - Hot reload, code generation, unified environment
- 📦 **Optimized Monorepo** - Turborepo + pnpm for blazing builds

## 🚀 Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your database URL and auth secret

# 3. Set up database
pnpm db:push
pnpm db:generate

# 4. Start development servers
pnpm dev
```

**Access your application:**
- 🌐 **Frontend**: http://localhost:5173
- ⚡ **API**: http://localhost:3001
- 🗃️ **Database Studio**: `pnpm db:studio`

## 📁 Project Structure

```
vitro-supercharged/
├── apps/
│   ├── web/                    # 🌐 Vite + React frontend
│   └── api/                    # ⚡ Nitro backend server
├── packages/
│   ├── auth/                   # 🔐 Better Auth configuration
│   ├── database/               # 🗃️ Prisma schema & client
│   ├── trpc/                   # 🔄 tRPC routers & procedures
│   └── ui/                     # 🎨 Shared UI components (Shadcn/UI)
├── tooling/
│   ├── biome/                  # 🛠️ Code quality (linting & formatting)
│   ├── generator/              # 📦 Package scaffolding tool
│   └── tsconfig/               # ⚙️ Shared TypeScript configs
└── docs/                       # 📚 Documentation
```

## 🛠️ Tech Stack

### Frontend
- **⚡ Vite** - Lightning fast build tool
- **⚛️ React 18** - UI framework with TypeScript
- **🧭 TanStack Router** - File-based routing
- **🔄 TanStack Query** - Server state management
- **🎨 Tailwind CSS** - Utility-first styling
- **🧩 Shadcn/UI** - Beautiful component library

### Backend  
- **🚀 Nitro** - Universal JavaScript server
- **🌐 H3** - HTTP framework
- **🔄 tRPC v11** - Type-safe API layer
- **🔐 Better Auth** - Modern authentication system
- **✅ ArkType** - Runtime validation

### Database & Auth
- **🐘 PostgreSQL** - Robust relational database
- **🔷 Prisma ORM** - Type-safe database client
- **👤 Session Management** - Secure user sessions

### Development Tools
- **🏗️ Turborepo** - High-performance monorepo build system
- **📦 pnpm** - Fast, disk space efficient package manager
- **🛠️ Biome** - Ultra-fast linting, formatting, and import organization
- **📝 TypeScript** - End-to-end type safety
- **🔧 VS Code** - Integrated development environment

## 📚 Documentation

**[📖 Complete Documentation](./docs/)** - Setup guides, architecture, and best practices

### Core Guides
- **[🚀 Development Workflow](./docs/development.md)** - Local setup and commands
- **[🏗️ Infrastructure & Deployment](./docs/infrastructure.md)** - Hosting and deployment
- **[⚙️ CI/CD Workflows](./docs/cicd.md)** - GitHub Actions and automation

### Package Documentation
- **[Authentication](./packages/auth/README.md)** - Better Auth setup and usage
- **[Database](./packages/database/README.md)** - Prisma schema and operations
- **[tRPC API](./packages/trpc/README.md)** - Type-safe API procedures
- **[UI Components](./packages/ui/README.md)** - Shadcn/UI component library

### Tooling Documentation  
- **[Code Quality](./tooling/biome/README.md)** - Biome configuration
- **[Package Generator](./tooling/generator/README.md)** - Creating new packages
- **[TypeScript Config](./tooling/tsconfig/README.md)** - Shared TypeScript settings

## 🏃‍♂️ Available Scripts

### Development
```bash
pnpm dev                        # Start all development servers
pnpm --filter @repo/web dev     # Frontend only (port 5173)
pnpm --filter @repo/api dev     # Backend only (port 3001)
```

### Building
```bash
pnpm build                      # Build all packages and apps
pnpm type-check                 # Run TypeScript checks across monorepo
```

### Database Operations
```bash
pnpm db:generate                # Generate Prisma client
pnpm db:push                    # Push schema changes to database
pnpm db:migrate                 # Run database migrations
pnpm db:studio                  # Open Prisma Studio GUI
pnpm db:seed                    # Seed database with sample data
```

### Code Quality (Biome)
```bash
pnpm biome:check                # Check code quality issues
pnpm biome:fix                  # Auto-fix code quality issues
pnpm lint                       # Lint all packages
```

**VS Code Setup**: Install `biomejs.biome` extension for auto-formatting on save, import organization, and real-time linting.

### Package Generation
```bash
pnpm generate                   # Interactive package generator
```

## 💻 Development

```bash
# Quick setup
cp .env.example .env    # Configure environment
pnpm db:push           # Setup database
pnpm dev               # Start development servers
```

**[📖 Development Guide](./docs/development.md)** - Detailed workflow and best practices

## 🚀 API Architecture

**Dual API Design:**
- **tRPC** - Type-safe client-server communication
- **GraphQL** - Flexible queries with auto-generated CRUD

```typescript
// Type-safe tRPC calls
const user = await trpc.users.profile.query();
const posts = await trpc.posts.list.query();
```

**[📖 API Documentation](./docs/)** - Complete tRPC and GraphQL guides

## 🔐 Authentication

**Better Auth** with email/password, secure sessions, and protected routes.

```typescript
import { authActions } from '@repo/auth/client';
const result = await authActions.signIn({ email, password });
```

**[📖 Auth Guide](./packages/auth/README.md)** - Setup, usage, and security patterns

## 🗃️ Database

**Prisma ORM** with PostgreSQL, featuring User management, Auth sessions, and content models.

**[📖 Database Guide](./packages/database/README.md)** - Schema, relationships, and operations

## 🎨 UI Components

**Shadcn/UI** components with **Tailwind CSS** styling and **TanStack Router** for navigation.

```bash
npx shadcn@latest add dialog  # Add new components
```

**[📖 UI Guide](./packages/ui/README.md)** - Component library and patterns

## 🌍 Environment Setup

**Turbo loose mode** - single `.env` file for all packages.

```env
# Required
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb"
BETTER_AUTH_SECRET="your-super-secret-32-char-minimum-key"
```

**[📖 Environment Guide](./docs/environment.md)** - Complete configuration reference

## 🚀 Deployment

```bash
pnpm build  # Creates production builds
# Frontend: ./apps/web/dist/
# Backend: ./apps/api/.output/
```

**Recommended Platforms:**
- **Full-stack**: Railway, Render
- **Frontend**: Vercel, Netlify
- **Database**: Neon, Supabase

**[📖 Deployment Guide](./docs/infrastructure.md)** - Platform-specific instructions

## 🤝 Contributing

```bash
git clone <your-fork>
pnpm install && cp .env.example .env
pnpm db:push && pnpm dev
```

**[📖 Contributing Guide](./docs/development.md)** - Development setup and guidelines

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ using modern TypeScript, React, and Node.js technologies**