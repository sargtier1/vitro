# Development Workflow

## Quick Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your database URL and auth secret

# 3. Set up database
pnpm db:push && pnpm db:generate

# 4. Start development
pnpm dev
```

## Access Points

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001
- **Database Studio**: `pnpm db:studio`

## Common Commands

```bash
# Development
pnpm dev                        # Start all servers
pnpm --filter @repo/web dev     # Frontend only
pnpm --filter @repo/api dev     # Backend only

# Database
pnpm db:generate                # Generate Prisma client
pnpm db:push                    # Push schema changes
pnpm db:studio                  # Open database GUI
pnpm db:seed                    # Add sample data

# Code Quality
pnpm biome:check                # Check code issues
pnpm biome:fix                  # Auto-fix issues
pnpm type-check                 # TypeScript checks

# Building
pnpm build                      # Build all packages
pnpm generate                   # Create new packages

# Infrastructure
pnpm infra:setup                # Setup deployment
pnpm infra:deploy               # Deploy to platform
```

**VS Code**: Install `biomejs.biome` extension for auto-formatting.

## Infrastructure Development

### Local Environment
```bash
# Required environment variables
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
BETTER_AUTH_SECRET="32-character-minimum-secret"

# Optional
VITE_API_URL="http://localhost:3001"
NITRO_PORT=3001
```

### CI/CD Testing
```bash
# Test build locally
pnpm build

# Test with production-like environment
NODE_ENV=production pnpm build
```

### Deployment Testing
```bash
# Validate deployment configuration
pnpm infra:setup

# Test deployment process
pnpm infra:deploy
```

## Project Structure

```
vitro-supercharged/
├── apps/
│   ├── web/                    # React frontend
│   └── api/                    # Nitro backend
├── packages/
│   ├── auth/                   # Better Auth
│   ├── database/               # Prisma & database
│   ├── trpc/                   # tRPC API
│   └── ui/                     # Shadcn/UI components
├── tooling/
│   ├── biome/                  # Code quality
│   ├── generator/              # Package creator
│   └── tsconfig/               # TypeScript configs
└── docs/                       # Documentation
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port conflicts | Change `NITRO_PORT` in `.env` |
| Database errors | Verify `DATABASE_URL` and run `pnpm db:generate` |
| Auth errors | Check `BETTER_AUTH_SECRET` is set |
| Type errors | Run `pnpm db:generate` after schema changes |
| Build errors | Run `pnpm biome:fix` |