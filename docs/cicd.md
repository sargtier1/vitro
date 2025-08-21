# CI/CD Workflows

## **GitHub Actions Setup**

The project includes automated workflows for testing, building, and deployment.

### **Workflows Overview**

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **PR Checks** | Pull requests | Quality gates (lint, test, build) |
| **Trunk Deployment** | Push to main | Production deployment |
| **Northflank Integration** | After deployment | Infrastructure deployment |
| **Dependency Updates** | Weekly schedule | Automated dependency updates |

## **Pull Request Workflow**

**File**: `.github/workflows/pr-checks.yml`

```yaml
# Triggers on PR to main branch
# Runs: lint, type-check, test, build
# Required secrets: None (uses test database)
```

**Steps:**
1. Install dependencies with pnpm
2. Setup test environment (`DATABASE_URL` for testing)
3. Generate Prisma client
4. Run code quality checks (Biome, TypeScript)
5. Build applications (web + api)
6. Security audit

**Requirements:**
- All checks must pass for PR merge
- No secrets required (uses mock database)

## **Production Deployment**

**File**: `.github/workflows/trunk-deployment.yml`

```yaml
# Triggers on push to main branch
# Builds and deploys to production
# Required secrets: DATABASE_URL
```

**Steps:**
1. Quality checks (lint, test, type-check)
2. Build applications with production environment
3. Database operations (`db:deploy`)
4. Upload build artifacts
5. Deployment verification

**Required Secrets:**
```bash
# GitHub Repository Secrets
DATABASE_URL="postgresql://prod-connection-string"
```

## **Northflank Integration**

**File**: `.github/workflows/northflank-integration.yml`

```yaml
# Triggers after trunk deployment completes
# Provides deployment instructions and build artifacts
```

**Features:**
- Build verification for Northflank deployment
- Deployment guide generation
- Build artifact upload for manual deployment

## **Environment Setup**

### **Repository Secrets**

Configure in GitHub Settings > Secrets and variables > Actions:

```bash
# Required for production deployment
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Optional (defaults provided)
BETTER_AUTH_SECRET="32-character-secret"
VITE_API_URL="https://your-api-domain.com"
```

### **Local Development**

```bash
# No CI/CD secrets needed for local development
cp .env.example .env
# Edit .env with local database URL
```

## **Build Commands**

### **CI/CD Build Process**

```bash
# 1. Install dependencies
pnpm install --frozen-lockfile

# 2. Setup environment
echo 'DATABASE_URL="..."' > .env

# 3. Generate database client
pnpm db:generate

# 4. Build applications
pnpm --filter @repo/api build    # → apps/api/.output/
pnpm --filter @repo/web build    # → apps/web/dist/
```

### **Quality Checks**

```bash
# Code formatting and linting
pnpm biome:check

# TypeScript validation
pnpm type-check

# Dependency security audit
pnpm audit --audit-level high
```

## **Deployment Artifacts**

### **Build Outputs**

| App | Output Directory | Description |
|-----|------------------|-------------|
| **API** | `apps/api/.output/` | Nitro server build |
| **Web** | `apps/web/dist/` | Static frontend assets |

### **Artifact Upload**

- **Retention**: 7 days for trunk builds, 30 days for deployment-ready builds
- **Contents**: Build outputs + deployment configuration
- **Usage**: Manual deployment or Northflank integration

## **Infrastructure Integration**

### **Database Operations**

```bash
# During CI/CD
pnpm db:generate  # Generate Prisma client
pnpm db:deploy    # Run production migrations
```

### **Environment Variables**

CI/CD workflows automatically handle:
- Test environment setup for PR checks
- Production environment for deployments
- Fallback values for missing optional variables

## **Monitoring & Notifications**

### **Workflow Status**

- ✅ **Success**: All checks pass, deployment ready
- ❌ **Failure**: Check logs, fix issues, retry
- ⚠️ **Warnings**: Non-blocking issues (outdated dependencies)

### **Deployment Verification**

- Build artifact validation
- Health endpoint checks
- Database migration status
- Security audit results

## **Troubleshooting**

### **Common Issues**

**Build Failures:**
```bash
# Missing environment variables
# Solution: Check GitHub secrets configuration

# Database connection errors  
# Solution: Verify DATABASE_URL format

# Dependency conflicts
# Solution: Update pnpm-lock.yaml
```

**Deployment Issues:**
```bash
# Missing build artifacts
# Solution: Check build step logs

# Prisma generation errors
# Solution: Verify schema.prisma syntax
```

### **Manual Deployment**

If automated deployment fails:

```bash
# 1. Download artifacts from GitHub Actions
# 2. Deploy manually to your platform
# 3. Update environment variables
# 4. Run database migrations
```