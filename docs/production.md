# Production Setup

## Build Process

### Production Build

```bash
# Build all packages and apps
pnpm build

# Build specific package
pnpm --filter @repo/web build
pnpm --filter @repo/api build

# Check build output
ls -la apps/web/dist/      # Frontend static files
ls -la apps/api/.output/   # Backend server bundle
```

### Build Outputs

**Frontend (Static Files):**
```
apps/web/dist/
├── index.html            # Main HTML file
├── assets/
│   ├── index-[hash].js   # Main JavaScript bundle
│   ├── index-[hash].css  # Styles bundle
│   └── vendor-[hash].js  # Vendor dependencies
└── manifest.json         # Asset manifest
```

**Backend (Server Bundle):**
```
apps/api/.output/
├── server/
│   └── index.mjs         # Nitro server bundle
├── public/               # Static assets
└── nitro.json           # Build metadata
```

## Environment Configuration

### Production Environment Variables

```env
# Required Production Variables
DATABASE_URL="postgresql://prod-user:prod-pass@prod-host:5432/prod-db"
BETTER_AUTH_SECRET="secure-production-secret-minimum-32-characters"
NODE_ENV=production

# Application URLs
VITE_API_URL=https://api.yourdomain.com
WEB_URL=https://yourdomain.com

# Optional Configuration
NITRO_PORT=3001
NITRO_HOST=0.0.0.0
LOG_LEVEL=info
```

### Environment Validation

```typescript
// packages/config/src/production.ts
import { z } from 'zod';

const ProductionEnvSchema = z.object({
  NODE_ENV: z.literal('production'),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  VITE_API_URL: z.string().url(),
  WEB_URL: z.string().url(),
  NITRO_PORT: z.coerce.number().default(3001),
  NITRO_HOST: z.string().default('0.0.0.0'),
});

export const productionEnv = ProductionEnvSchema.parse(process.env);
```

## Database Setup

### Production Database Migration

```bash
# Apply migrations to production database
DATABASE_URL="production-url" pnpm db:migrate deploy

# Verify migration status
DATABASE_URL="production-url" pnpm db:migrate status

# Generate client for production schema
DATABASE_URL="production-url" pnpm db:generate
```

### Connection Pooling

```typescript
// packages/database/src/production.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error', 'warn'],
  
  // Production optimizations
  __internal: {
    engine: {
      enableEngineDebugMode: false,
    },
  },
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

## Performance Optimization

### Frontend Optimization

```typescript
// apps/web/vite.config.ts (production)
export default defineConfig({
  build: {
    minify: 'terser',
    sourcemap: false,
    
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-router'],
          query: ['@tanstack/react-query'],
          trpc: ['@trpc/client', '@trpc/react-query'],
        },
      },
    },
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
```

### Backend Optimization

```typescript
// apps/api/nitro.config.ts (production)
export default defineNitroConfig({
  preset: 'node-server',
  
  minify: true,
  sourceMap: false,
  
  storage: {
    cache: {
      driver: 'redis',
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
  },
  
  routeRules: {
    '/api/health': { 
      headers: { 'cache-control': 's-maxage=60' } 
    },
    '/api/auth/**': { 
      headers: { 'cache-control': 'no-cache' } 
    },
  },
  
  experimental: {
    wasm: false,
  },
});
```

## Security Configuration

### Security Headers

```typescript
// apps/api/src/plugins/security.ts
export default defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook('render:response', async (response, { event }) => {
    // Security headers
    setResponseHeaders(event, {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    });
  });
});
```

### CORS Configuration

```typescript
// apps/api/src/plugins/cors.ts
export default defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook('render:route', async (url, result, context) => {
    const allowedOrigins = [
      process.env.WEB_URL,
      process.env.ADMIN_URL,
    ].filter(Boolean);

    const origin = getHeader(context.event, 'origin');
    
    if (origin && allowedOrigins.includes(origin)) {
      setResponseHeaders(context.event, {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      });
    }
  });
});
```

### Rate Limiting

```typescript
// apps/api/src/middleware/rateLimit.ts
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV !== 'production') return;
  
  const ip = getClientIP(event);
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;
  
  const key = `rate-limit:${ip}`;
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return;
  }
  
  if (current.count >= maxRequests) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
    });
  }
  
  current.count++;
});
```

## Monitoring & Logging

### Application Logging

```typescript
// packages/logger/src/production.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  
  transports: [
    // Console output for container logs
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    
    // File logging for persistent storage
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

// Log unhandled exceptions
logger.exceptions.handle(
  new winston.transports.File({ filename: 'logs/exceptions.log' })
);

logger.rejections.handle(
  new winston.transports.File({ filename: 'logs/rejections.log' })
);
```

### Health Checks

```typescript
// apps/api/src/api/health.ts
export default defineEventHandler(async (event) => {
  const start = Date.now();
  
  try {
    // Database health check
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - start;
    
    // Auth service health check
    const authHealthy = await checkAuthService();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - start,
      services: {
        database: {
          connected: true,
          responseTime: dbResponseTime,
        },
        auth: {
          configured: authHealthy,
        },
      },
    };
  } catch (error) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      data: {
        status: 'unhealthy',
        error: error.message,
      },
    });
  }
});
```

### Error Tracking

```typescript
// packages/monitoring/src/sentry.ts
import * as Sentry from '@sentry/node';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Prisma({ client: prisma }),
    ],
    
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
  });
}

export { Sentry };
```

## Deployment Strategies

### Container Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS base
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml ./
RUN pnpm fetch

FROM base AS build
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm install --offline
RUN pnpm build

FROM base AS runtime
WORKDIR /app
COPY --from=build /app/apps/api/.output ./
EXPOSE 3001
CMD ["node", "server/index.mjs"]
```

### Static Frontend Deployment

```yaml
# deploy/frontend.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vitro-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vitro-frontend
  template:
    metadata:
      labels:
        app: vitro-frontend
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
        volumeMounts:
        - name: static-files
          mountPath: /usr/share/nginx/html
      volumes:
      - name: static-files
        configMap:
          name: vitro-static-files
```

### Backend Service Deployment

```yaml
# deploy/backend.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vitro-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: vitro-backend
  template:
    metadata:
      labels:
        app: vitro-backend
    spec:
      containers:
      - name: api
        image: vitro/api:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: vitro-secrets
              key: database-url
        - name: BETTER_AUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: vitro-secrets
              key: auth-secret
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 15
          periodSeconds: 10
```

## Performance Monitoring

### Metrics Collection

```typescript
// packages/metrics/src/collector.ts
import client from 'prom-client';

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

const databaseQueryDuration = new client.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
});

export { httpRequestDuration, databaseQueryDuration };
```

### Performance Middleware

```typescript
// apps/api/src/middleware/metrics.ts
export default defineEventHandler(async (event) => {
  const start = Date.now();
  
  try {
    await runWithAsyncContext(async () => {
      // Process request
    });
  } finally {
    const duration = (Date.now() - start) / 1000;
    
    httpRequestDuration
      .labels(
        getMethod(event),
        getRouterParam(event, 'route') || 'unknown',
        event.node.res.statusCode.toString()
      )
      .observe(duration);
  }
});
```

## Backup & Recovery

### Automated Backups

```bash
#!/bin/bash
# scripts/backup.sh

set -e

# Database backup
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="vitro_backup_${DATE}.sql"

pg_dump $DATABASE_URL > "/backups/${BACKUP_FILE}"

# Compress backup
gzip "/backups/${BACKUP_FILE}"

# Upload to cloud storage
aws s3 cp "/backups/${BACKUP_FILE}.gz" "s3://vitro-backups/"

# Clean up old local backups (keep last 7 days)
find /backups -name "vitro_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

### Disaster Recovery

```bash
#!/bin/bash
# scripts/restore.sh

set -e

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup-file>"
  exit 1
fi

# Download backup from cloud storage
aws s3 cp "s3://vitro-backups/${BACKUP_FILE}" ./

# Extract backup
gunzip "${BACKUP_FILE}"

# Restore database
psql $DATABASE_URL < "${BACKUP_FILE%.gz}"

echo "Database restored from ${BACKUP_FILE}"
```

## Best Practices

### 1. Environment Management
- Use different secrets for each environment
- Validate all environment variables at startup
- Never expose development credentials

### 2. Database Management
- Use connection pooling for better performance
- Implement proper backup strategies
- Monitor query performance

### 3. Security
- Enable all security headers
- Implement rate limiting
- Use HTTPS everywhere
- Regular security audits

### 4. Monitoring
- Set up comprehensive logging
- Monitor application metrics
- Implement health checks
- Use error tracking services

### 5. Performance
- Optimize bundle sizes
- Enable compression
- Use CDN for static assets
- Implement caching strategies

### 6. Deployment
- Use blue-green deployments
- Implement rolling updates
- Have rollback procedures
- Test deployments in staging