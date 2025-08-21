# Infrastructure & Deployment

## **System Architecture**

```mermaid
graph LR
    subgraph "Frontend Apps"
        WEB[Vite React App<br/>tRPC Client]
    end
    
    subgraph "Backend Services"
        NITRO[Nitro Server<br/>tRPC API<br/>Better Auth]
        DB[(PostgreSQL)]
    end
    
    WEB -.->|tRPC calls| NITRO
    NITRO --> DB
```

## **Infrastructure Requirements**

### **Essential Services**
- **Database**: PostgreSQL (required for Prisma ORM)
- **API Server**: Node.js runtime for Nitro
- **Static Hosting**: CDN for frontend assets

### **Environment Variables**
```env
# Required
DATABASE_URL="postgresql://user:pass@host:5432/db"
BETTER_AUTH_SECRET="32-character-minimum-secret"

# Optional
VITE_API_URL="https://your-api-domain.com"
NITRO_PORT=3001
```

## **Deployment Platforms**

### **Recommended: Northflank**
```bash
# Setup Northflank deployment
pnpm infra:setup
pnpm infra:deploy
```

**Services Configuration:**
- **API Service**: Node.js app with build command
- **Web Service**: Static site deployment  
- **PostgreSQL**: Managed database addon

### **Alternative Platforms**
- **Railway**: Full-stack deployment
- **Render**: Web services + PostgreSQL
- **Vercel + Neon**: Frontend + database
- **Netlify + Supabase**: Static + serverless

## **CI/CD Workflows**

### **GitHub Actions**
- **PR Checks**: Type checking, linting, builds
- **Trunk Deployment**: Production deployment on main branch
- **Northflank Integration**: Automated deployment setup

### **Build Commands**
```bash
# API Build
pnpm install && pnpm db:generate && pnpm --filter @repo/api build

# Web Build  
pnpm install && pnpm --filter @repo/web build
```

## **Infrastructure Scripts**

```bash
# Setup deployment configuration
pnpm infra:setup

# Deploy to configured platform
pnpm infra:deploy

# Database operations
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema changes
pnpm db:migrate   # Run migrations
```

## **Monitoring & Health**

### **Health Endpoints**
- API: `/api/health`
- Database: Prisma connection status

### **Environment Validation**
- Required environment variables check
- Database connectivity test
- Build artifact verification