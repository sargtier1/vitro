# @repo/logger

A simple logging package using Consola with enhanced features for TypeScript projects.

## Features

- **Multiple log levels**: Debug, Info, Warn, Error, Success, Env, Startup
- **Service-scoped logging**: Create loggers for specific services
- **Environment-aware**: Different behavior in development vs production
- **Secure environment logging**: Automatically redacts sensitive values
- **Cross-platform**: Works in both Node.js and browser environments
- **Colored output**: Color-coded log levels (Node.js only)
- **Configurable**: Customizable log levels and features

## Installation

```bash
pnpm add @repo/logger
```

## Usage

### Basic Usage

```typescript
import { createLogger } from '@repo/logger';

const logger = createLogger('my-service');

logger.info('Application started');
logger.warn('This is a warning');
logger.error('Something went wrong');
logger.success('Operation completed successfully');
logger.debug('Debug information');
```

### Pre-configured Loggers

```typescript
import { 
  serverLogger, 
  dbLogger, 
  authLogger, 
  frontendLogger, 
  apiLogger,
  devLogger 
} from '@repo/logger';

serverLogger.info('Server is running on port 3000');
dbLogger.success('Database connection established');
authLogger.warn('Invalid login attempt');
```

### Environment Logging

```typescript
import { logEnvironment, devLogger } from '@repo/logger';

// Log all required environment variables
logEnvironment();

// Or use a specific logger
logEnvironment(devLogger);

// Log individual environment variables
logger.env('DATABASE_URL', process.env.DATABASE_URL);
logger.env('NODE_ENV', process.env.NODE_ENV);
```

### Custom Configuration

```typescript
import { createLogger, LogLevel } from '@repo/logger';

const customLogger = createLogger('custom', {
  enableDebug: false,
  enableEnvLogging: true,
  enableStartupLogging: true,
  minLevel: LogLevel.Warn
});
```

## Log Levels

| Level | Icon | Description |
|-------|------|-------------|
| Debug | ◉ | Detailed information for debugging |
| Info | ● | General information messages |
| Warn | ▲ | Warning messages |
| Error | ✕ | Error messages |
| Success | ✓ | Success messages |
| Env | ⚙ | Environment variable logging |
| Startup | ⬢ | Application startup messages |

## Security Features

The logger automatically protects sensitive information:

- Environment variables containing `secret`, `key`, `password`, or `token` are redacted
- Long URLs (>50 characters) are truncated
- Missing environment variables are clearly marked as `[MISSING]`
- Boolean values are displayed as `[CONFIGURED]` or `[DISABLED]`

## Configuration Options

### LoggerConfig

```typescript
interface LoggerConfig {
  enableDebug?: boolean;          // Enable debug logging (default: true in development)
  enableEnvLogging?: boolean;     // Enable environment variable logging
  enableStartupLogging?: boolean; // Enable startup logging
  minLevel?: LogLevelType;        // Minimum log level to display
}
```

### Environment Variables

- `NODE_ENV`: Controls default logging behavior
- `LOG_ENV`: Force enable environment logging (set to 'true')

## Output Format

```
HH:MM:SS [service] ICON LEVEL message
```

Example:
```
14:30:25 [server] ● INFO Server started on port 3000
14:30:25 [db] ✓ SUCCESS Database connection established
14:30:26 [auth] ▲ WARN Rate limit exceeded for user
```

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type { CustomLogger, LoggerConfig } from '@repo/logger';
import { LogLevel } from '@repo/logger';
```

## License

Private package - access restricted.