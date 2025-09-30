# @repo/logger

A simple logging package using Consola with enhanced features for TypeScript projects.

## Features

- **Multiple log levels**: Debug, Info, Warn, Error, Success, Env, Startup
- **Service-scoped logging**: Create loggers for specific services
- **Environment-aware**: Different behavior in development vs production
- **JSON output in production**: Automatically outputs structured JSON logs in production environments (including Railway)
- **Secure environment logging**: Automatically redacts sensitive values
- **Cross-platform**: Works in both Node.js and browser environments with automatic environment detection
- **Colored output**: Color-coded log levels (development only)
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
  useJsonOutput?: boolean;        // Force JSON output (auto-detected in production)
}
```

### Environment Variables

- `NODE_ENV`: Controls default logging behavior
- `LOG_ENV`: Force enable environment logging (set to 'true')
- `RAILWAY_ENVIRONMENT` or `RAILWAY_PROJECT_ID`: Automatically detected for Railway deployments

## JSON Output

The logger automatically switches to JSON output in production environments for better log parsing and monitoring:

### Development Output (Formatted)
```
19:30:25 [server] ● INFO Server started on port 3000
19:30:25 [db] ✓ SUCCESS Database connection established
```

### Production Output (JSON)
```json
{"timestamp":"2025-09-30T00:30:25.123Z","service":"server","level":"info","message":"Server started on port 3000"}
{"timestamp":"2025-09-30T00:30:25.456Z","service":"db","level":"success","message":"Database connection established"}
```

### Railway Detection
The logger automatically detects Railway environments and switches to JSON output even if `NODE_ENV` is not set to 'production'.

## Browser Compatibility

The logger works seamlessly in both Node.js and browser environments:

### Node.js Environment
- Full feature set including environment variable detection
- JSON output in production environments
- Environment variable logging with security redaction

### Browser Environment
- Core logging functionality (info, warn, error, success, debug)
- Automatic fallback to development mode (formatted output)
- Environment variable logging is safely disabled
- No `process.env` dependencies

```typescript
// Works in both environments
const logger = createLogger('my-app');
logger.info('This works everywhere!');
```

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