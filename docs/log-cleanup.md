# Log Cleanup Guide

## Overview

This guide helps you reduce development log noise and create cleaner console output for better debugging and development experience.

## Turbo Configuration

### Clean Pipeline Output

```json
// turbo.json
{
  "pipeline": {
    "dev": {
      "cache": false,
      "persistent": true,
      "dependsOn": ["^build"],
      "outputMode": "new-only"
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".output/**"],
      "outputMode": "hash-only"
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputMode": "errors-only"
    }
  },
  "globalEnv": ["NODE_ENV", "DATABASE_URL"],
  "ui": "tui"
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "turbo dev --filter=@repo/web --filter=@repo/api",
    "dev:quiet": "turbo dev --filter=@repo/web --filter=@repo/api --output-logs=errors-only",
    "build": "turbo build --output-logs=hash-only",
    "build:verbose": "turbo build --output-logs=full"
  }
}
```

## Tool-Specific Configurations

### Vite (Frontend)

```typescript
// apps/web/vite.config.ts
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  
  return {
    // Reduce build info
    logLevel: isDev ? 'info' : 'warn',
    
    server: {
      // Quiet server startup
      host: true,
      port: 5173,
    },
    
    // Clean build output
    build: {
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1000,
    },
    
    // Reduce plugin noise
    plugins: [
      react({
        // Disable React refresh logs in dev
        include: "**/*.{jsx,tsx}",
      }),
      TanStackRouterVite({
        // Quiet route generation
        generatedRouteTree: './src/routeTree.gen.ts',
      }),
    ],
  };
});
```

### Nitro (Backend)

```typescript
// apps/api/nitro.config.ts
export default defineNitroConfig({
  // Development logging
  devtools: { enabled: false },
  
  // Reduce startup noise
  experimental: {
    wasm: false,
  },
  
  // Clean route info
  routeRules: {
    '/api/**': { 
      headers: { 'x-nitro-prerender': 'false' }
    },
  },
  
  // Minimal dev output
  devProxy: {},
  
  // Production optimizations
  minify: true,
  sourceMap: false,
});
```

### TypeScript

```json
// packages/tsconfig/base.json
{
  "compilerOptions": {
    "pretty": true,
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  },
  "watchOptions": {
    "excludeDirectories": ["**/node_modules", "**/.git"],
    "excludeFiles": ["**/.tsbuildinfo"]
  }
}
```

### Prisma

```typescript
// packages/database/src/index.ts
import { PrismaClient } from '@prisma/client';

const isDev = process.env.NODE_ENV === 'development';

export const prisma = new PrismaClient({
  log: isDev 
    ? [{ level: 'error', emit: 'stdout' }]
    : [],
  
  errorFormat: 'minimal',
});

// Quiet connection
if (isDev) {
  prisma.$on('error', (e) => {
    console.error('Database error:', e.message);
  });
}
```

## Environment Variables

### Global Noise Reduction

```env
# .env.development
NODE_ENV=development
LOG_LEVEL=error

# Prisma
PRISMA_HIDE_UPDATE_MESSAGE=true

# Disable analytics
NEXT_TELEMETRY_DISABLED=1
ASTRO_TELEMETRY_DISABLED=1

# Reduce package manager noise
NPM_CONFIG_LOGLEVEL=error
PNPM_CONFIG_REPORTER=silent-with-summary
```

### Tool-Specific Variables

```env
# Vite
VITE_LOG_LEVEL=warn

# Nitro
NITRO_LOG_LEVEL=1

# TypeScript
TSC_NONPOLLING_WATCHER=1
TSC_WATCHFILE=UseFsEventsWithFallbackDynamicPolling
```

## Package.json Configuration

### Clean Scripts

```json
{
  "scripts": {
    "dev": "turbo dev --ui=tui",
    "dev:clean": "turbo dev --ui=tui --output-logs=errors-only",
    "dev:verbose": "turbo dev --ui=stream --output-logs=full",
    
    "build": "turbo build --output-logs=hash-only",
    "build:clean": "turbo build --output-logs=none --ui=tui",
    
    "type-check": "turbo type-check --output-logs=errors-only",
    "lint": "turbo lint --output-logs=errors-only"
  }
}
```

### Package-Specific Scripts

```json
// apps/web/package.json
{
  "scripts": {
    "dev": "vite --logLevel warn",
    "dev:verbose": "vite --logLevel info",
    "build": "vite build --logLevel error"
  }
}

// apps/api/package.json  
{
  "scripts": {
    "dev": "nitro dev",
    "dev:quiet": "NITRO_LOG_LEVEL=0 nitro dev",
    "build": "nitro build"
  }
}
```

## Console Output Customization

### Custom Dev Script

```bash
#!/bin/bash
# scripts/dev-clean.sh

# Clear terminal
clear

echo "🚀 Starting Vitro development servers..."
echo ""

# Start with clean output
FORCE_COLOR=1 pnpm turbo dev \
  --filter=@repo/web \
  --filter=@repo/api \
  --ui=tui \
  --output-logs=errors-only

# Alternative: Group logs by service
# pnpm turbo dev --ui=stream --output-logs=grouped
```

### Log Filtering

```javascript
// scripts/filter-logs.js
const originalLog = console.log;
const originalWarn = console.warn;

// Filter out common noise
const NOISE_PATTERNS = [
  /Local:\s+http:\/\/localhost/,
  /ready in/i,
  /hmr update/i,
  /page reload/i,
];

console.log = (...args) => {
  const message = args.join(' ');
  if (!NOISE_PATTERNS.some(pattern => pattern.test(message))) {
    originalLog(...args);
  }
};

console.warn = (...args) => {
  const message = args.join(' ');
  if (!message.includes('deprecated') && !message.includes('warning')) {
    originalWarn(...args);
  }
};
```

## VS Code Settings

### Workspace Configuration

```json
// .vscode/settings.json
{
  "typescript.preferences.noIncludedCompletionEtions": false,
  "typescript.surveys.enabled": false,
  "typescript.suggest.autoImports": false,
  
  "terminal.integrated.scrollback": 1000,
  "terminal.integrated.smoothScrolling": true,
  
  "problems.showCurrentInStatus": true,
  "problems.sortOrder": "severity",
  
  "output.smartScroll.enabled": false,
  
  "biome.lspBin": "biome",
  "biome.rename": true
}
```

### Task Configuration

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "dev:clean",
      "type": "shell",
      "command": "pnpm",
      "args": ["dev:clean"],
      "group": "build",
      "presentation": {
        "echo": false,
        "reveal": "always",
        "focus": false,
        "panel": "shared",
        "showReuseMessage": false,
        "clear": true
      },
      "problemMatcher": []
    }
  ]
}
```

## Log Aggregation

### Simple Logger

```typescript
// packages/logger/src/index.ts
export class Logger {
  private context: string;
  
  constructor(context: string) {
    this.context = context;
  }
  
  info(message: string, ...args: any[]) {
    if (process.env.LOG_LEVEL !== 'error') {
      console.log(`[${this.context}] ${message}`, ...args);
    }
  }
  
  warn(message: string, ...args: any[]) {
    console.warn(`⚠️ [${this.context}] ${message}`, ...args);
  }
  
  error(message: string, ...args: any[]) {
    console.error(`❌ [${this.context}] ${message}`, ...args);
  }
  
  success(message: string, ...args: any[]) {
    if (process.env.LOG_LEVEL !== 'error') {
      console.log(`✅ [${this.context}] ${message}`, ...args);
    }
  }
}

export const createLogger = (context: string) => new Logger(context);
```

### Usage Examples

```typescript
// apps/api/src/plugins/logger.ts
import { createLogger } from '@repo/logger';

const logger = createLogger('API');

export default defineNitroPlugin(async (nitroApp) => {
  nitroApp.hooks.hook('request', async (event) => {
    if (process.env.NODE_ENV === 'development') {
      logger.info(`${getMethod(event)} ${getRequestURL(event)}`);
    }
  });
  
  nitroApp.hooks.hook('error', async (error, { event }) => {
    logger.error(`Request error: ${error.message}`);
  });
});
```

## Expected Results

### Before Cleanup
```
Local:   http://localhost:5173/
ready in 847ms
[vite] hmr update /src/App.tsx
[vite] page reload src/main.tsx
Prisma schema loaded from prisma/schema.prisma
Generated Prisma Client (v5.22.0) in 245ms
Route tree generated in 123ms
TypeScript check started...
Linting...
```

### After Cleanup
```
🚀 Vitro Development Servers

✅ Frontend: http://localhost:5173
✅ API: http://localhost:3001
✅ Database: Connected

Ready for development!
```

## Implementation Steps

1. **Update turbo.json** with clean output modes
2. **Configure tool-specific settings** in config files
3. **Add environment variables** for noise reduction
4. **Create clean dev scripts** in package.json
5. **Set up VS Code workspace** for better terminal experience
6. **Implement custom logger** for structured output

This configuration provides a foundation for implementing a more sophisticated logger package while immediately improving the development experience.