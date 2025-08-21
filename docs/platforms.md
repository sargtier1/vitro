# Platform Deployment Guides

## Railway

### Full-Stack Deployment

Railway provides excellent monorepo support and can deploy both frontend and backend from a single repository.

#### Project Setup

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and create project
railway login
railway new vitro-app
railway link
```

#### Railway Configuration

```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/api/health"
restartPolicyType = "ON_FAILURE"

[[services]]
name = "api"
source = "apps/api"

[services.api.variables]
NODE_ENV = "production"
PORT = "3001"

[[services]]
name = "web"
source = "apps/web"

[services.web.variables]
NODE_ENV = "production"

[[services]]
name = "postgres"
plugin = "postgresql"
```

#### Environment Variables

```bash
# Set production environment variables
railway variables set DATABASE_URL="postgresql://..."
railway variables set BETTER_AUTH_SECRET="your-secret-here"
railway variables set VITE_API_URL="https://api-production.up.railway.app"
railway variables set WEB_URL="https://web-production.up.railway.app"
```

#### Build Configuration

```json
// apps/api/package.json
{
  "scripts": {
    "build": "nitro build",
    "start": "node .output/server/index.mjs"
  }
}
```

```json
// apps/web/package.json  
{
  "scripts": {
    "build": "vite build",
    "start": "vite preview --port $PORT --host 0.0.0.0"
  }
}
```

### Deploy Command

```bash
# Deploy all services
railway up

# Deploy specific service
railway up --service api
railway up --service web
```

## Vercel

### Frontend Deployment

Vercel is perfect for deploying the static frontend with automatic deployments.

#### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "pnpm --filter @repo/web build",
  "outputDirectory": "apps/web/dist",
  "installCommand": "pnpm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-api-domain.com/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        }
      ]
    }
  ]
}
```

#### Environment Variables

```bash
# Set in Vercel dashboard or CLI
vercel env add VITE_API_URL production
# Enter: https://your-api-domain.com

vercel env add WEB_URL production  
# Enter: https://your-app.vercel.app
```

#### Build Settings

- **Framework Preset**: Vite
- **Build Command**: `pnpm --filter @repo/web build`
- **Output Directory**: `apps/web/dist`
- **Install Command**: `pnpm install`

### Backend on Railway + Frontend on Vercel

This combination provides optimal performance and cost efficiency.

```typescript
// apps/web/src/config.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};
```

## Render

### Full-Stack Deployment

Render supports both static sites and backend services with automatic SSL.

#### Backend Service

```yaml
# render.yaml
services:
  - type: web
    name: vitro-api
    env: node
    buildCommand: "pnpm install && pnpm --filter @repo/api build"
    startCommand: "node apps/api/.output/server/index.mjs"
    healthCheckPath: "/api/health"
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: vitro-db
          property: connectionString
      - key: BETTER_AUTH_SECRET
        generateValue: true
        
  - type: static
    name: vitro-web
    buildCommand: "pnpm install && pnpm --filter @repo/web build"
    staticPublishPath: "./apps/web/dist"
    routes:
      - type: rewrite
        source: "/api/*"
        destination: "https://vitro-api.onrender.com/api/*"
        
databases:
  - name: vitro-db
    databaseName: vitro
    user: vitro
```

#### Environment Configuration

Set these in the Render dashboard:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
BETTER_AUTH_SECRET=your-32-char-secret
VITE_API_URL=https://vitro-api.onrender.com
WEB_URL=https://vitro-web.onrender.com
```

## Digital Ocean App Platform

### Multi-Service Application

Digital Ocean App Platform supports container-based deployments with managed databases.

#### App Spec Configuration

```yaml
# .do/app.yaml
name: vitro-app
services:
  - name: api
    source_dir: /apps/api
    github:
      repo: your-username/vitro-supercharged
      branch: main
    run_command: node .output/server/index.mjs
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /api
    health_check:
      http_path: /api/health
    envs:
      - key: NODE_ENV
        value: "production"
      - key: DATABASE_URL
        value: "${db.DATABASE_URL}"
      - key: BETTER_AUTH_SECRET
        value: "${BETTER_AUTH_SECRET}"
        type: SECRET
        
  - name: web
    source_dir: /apps/web
    github:
      repo: your-username/vitro-supercharged
      branch: main
    build_command: pnpm --filter @repo/web build
    run_command: npx serve -s dist -l 8080
    environment_slug: node-js
    instance_count: 1
    instance_size_slug: basic-xxs
    routes:
      - path: /
    envs:
      - key: VITE_API_URL
        value: "https://vitro-app-api.ondigitalocean.app"

databases:
  - name: db
    engine: PG
    version: "13"
    production: true
```

#### Deployment Commands

```bash
# Install doctl CLI
snap install doctl

# Authenticate
doctl auth init

# Create app
doctl apps create --spec .do/app.yaml

# Deploy updates
doctl apps create-deployment <app-id>
```

## Netlify

### Static Site with Edge Functions

Netlify is excellent for frontend deployment with serverless functions for API routes.

#### Netlify Configuration

```toml
# netlify.toml
[build]
  command = "pnpm --filter @repo/web build"
  functions = "netlify/functions"
  publish = "apps/web/dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
```

#### Edge Functions Setup

```typescript
// netlify/functions/api.ts
import { createNitroApp } from 'nitropack/runtime';
import { app } from '../../apps/api/.output/server/index.mjs';

export default async (request: Request, context: any) => {
  return await app.handler(request, context);
};
```

## Supabase + Vercel

### Database + Frontend Combination

Use Supabase for managed PostgreSQL and Vercel for frontend deployment.

#### Supabase Setup

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Run Prisma migrations
-- (Use connection string from Supabase dashboard)
```

#### Environment Configuration

```env
# Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:password@db.supabase.co:5432/postgres"

# Vercel frontend
VITE_API_URL="https://your-api.vercel.app"
```

## AWS (ECS + CloudFront)

### Enterprise-Grade Deployment

For large-scale applications requiring advanced infrastructure.

#### ECS Task Definition

```json
{
  "family": "vitro-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "api",
      "image": "your-account.dkr.ecr.region.amazonaws.com/vitro-api:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:vitro/database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/vitro-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### CloudFront Distribution

```yaml
# cloudformation/frontend.yml
Resources:
  Distribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          - Id: S3Origin
            DomainName: !GetAtt S3Bucket.DomainName
            S3OriginConfig:
              OriginAccessIdentity: !Sub "origin-access-identity/cloudfront/${OriginAccessIdentity}"
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad
        CacheBehaviors:
          - PathPattern: "/api/*"
            TargetOriginId: APIOrigin
            ViewerProtocolPolicy: https-only
```

## Platform Comparison

| Platform | Frontend | Backend | Database | Cost | Complexity |
|----------|----------|---------|----------|------|------------|
| Railway | ✅ | ✅ | ✅ | $$ | Low |
| Vercel + Railway | ✅ | ❌ | ❌ | $$ | Medium |
| Render | ✅ | ✅ | ✅ | $$ | Low |
| Digital Ocean | ✅ | ✅ | ✅ | $ | Medium |
| Netlify | ✅ | ⚠️ | ❌ | $ | Medium |
| AWS | ✅ | ✅ | ✅ | $$$ | High |

## Quick Start Commands

### Railway (Recommended for MVP)

```bash
railway new vitro-app
railway add --database postgresql
railway variables set BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
railway up
```

### Vercel + Supabase

```bash
# Frontend
vercel --prod

# Database
# Create project at supabase.com
# Copy connection string to environment variables
```

### Render

```bash
# Create render.yaml file
# Push to GitHub
# Connect repository in Render dashboard
```

## Environment-Specific Configurations

### Development

```env
NODE_ENV=development
DATABASE_URL="postgresql://localhost:5432/vitro_dev"
VITE_API_URL="http://localhost:3001"
```

### Staging

```env
NODE_ENV=production
DATABASE_URL="postgresql://staging-host:5432/vitro_staging"
VITE_API_URL="https://api-staging.yourdomain.com"
LOG_LEVEL=debug
```

### Production

```env
NODE_ENV=production
DATABASE_URL="postgresql://prod-host:5432/vitro_prod"
VITE_API_URL="https://api.yourdomain.com"
LOG_LEVEL=error
SENTRY_DSN="https://your-sentry-dsn"
```