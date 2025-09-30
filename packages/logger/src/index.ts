import { createConsola } from 'consola';

interface CustomLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  success(message: string): void;
  debug(message: string): void;
  env(envName: string, value?: string | boolean | null): void;
  startup(message: string): void;
}

const LogLevel = {
  Debug: 0,
  Info: 1,
  Warn: 2,
  Error: 3,
  Success: 4,
  Env: 5,
  Startup: 6,
} as const;

type LogLevelType = (typeof LogLevel)[keyof typeof LogLevel];

interface LoggerConfig {
  enableDebug?: boolean;
  enableEnvLogging?: boolean;
  enableStartupLogging?: boolean;
  minLevel?: LogLevelType;
  useJsonOutput?: boolean;
}

function formatTimestamp(): string {
  const now = new Date();
  return now.toTimeString().slice(0, 8);
}

// Icon mappings using text characters instead of emojis
function getIcon(level: LogLevelType): string {
  switch (level) {
    case LogLevel.Debug:
      return '◉';
    case LogLevel.Info:
      return '●';
    case LogLevel.Warn:
      return '▲';
    case LogLevel.Error:
      return '✕';
    case LogLevel.Success:
      return '✓';
    case LogLevel.Env:
      return '⚙';
    case LogLevel.Startup:
      return '⬢'; // Container-like hexagonal icon
    default:
      return '●';
  }
}

function isBrowser(): boolean {
  return typeof globalThis !== 'undefined' && 
         typeof (globalThis as any).window !== 'undefined' && 
         typeof (globalThis as any).document !== 'undefined';
}

function getColor(level: LogLevelType): string {
  // Disable colors in browser environment
  if (isBrowser()) {
    return '';
  }

  switch (level) {
    case LogLevel.Debug:
      return '\x1b[35m';
    case LogLevel.Info:
      return '\x1b[36m';
    case LogLevel.Warn:
      return '\x1b[33m';
    case LogLevel.Error:
      return '\x1b[31m';
    case LogLevel.Success:
      return '\x1b[32m';
    case LogLevel.Env:
      return '\x1b[34m';
    case LogLevel.Startup:
      return '\x1b[32m';
    default:
      return '\x1b[36m';
  }
}

function getLevelName(level: LogLevelType): string {
  switch (level) {
    case LogLevel.Debug:
      return 'DEBUG';
    case LogLevel.Info:
      return 'INFO';
    case LogLevel.Warn:
      return 'WARN';
    case LogLevel.Error:
      return 'ERROR';
    case LogLevel.Success:
      return 'SUCCESS';
    case LogLevel.Env:
      return 'ENV';
    case LogLevel.Startup:
      return 'STARTUP';
    default:
      return 'INFO';
  }
}

// Environment detection helpers
function getLoggerConfig(): LoggerConfig {
  // Check if we're in Node.js environment
  const isNode = typeof process !== 'undefined' && process.env;
  
  const env = isNode ? (process.env.NODE_ENV || 'development') : 'development';
  const isDevelopment = env === 'development';
  
  // Detect Railway or other production environments (Node.js only)
  const isProduction = isNode && (
    env === 'production' || 
    process.env.RAILWAY_ENVIRONMENT || 
    process.env.RAILWAY_PROJECT_ID
  );

  return {
    enableDebug: isDevelopment,
    enableEnvLogging: isNode && (isDevelopment || process.env.LOG_ENV === 'true'),
    enableStartupLogging: true,
    minLevel: isDevelopment ? LogLevel.Debug : LogLevel.Info,
    useJsonOutput: !!isProduction, // Use JSON output in production (Node.js only)
  };
}

// Create JSON reporter for production environments
function createJsonReporter(service: string, loggerConfig: LoggerConfig) {
  return {
    log: (logObj: any) => {
      let level: LogLevelType;

      // Map consola levels to our custom levels
      if (logObj.type === 'info' || logObj.type === 'log') {
        level = LogLevel.Info;
      } else if (logObj.type === 'warn') {
        level = LogLevel.Warn;
      } else if (logObj.type === 'error') {
        level = LogLevel.Error;
      } else if (logObj.type === 'success') {
        level = LogLevel.Success;
      } else if (logObj.type === 'debug') {
        level = LogLevel.Debug;
      } else {
        level = LogLevel.Info;
      }

      // Check if this log level should be shown
      if (level < loggerConfig.minLevel!) {
        return;
      }

      const logEntry = {
        timestamp: new Date().toISOString(),
        service,
        level: getLevelName(level).toLowerCase(),
        message: logObj.args.join(' '),
        // Add any additional metadata
        ...(logObj.extra && { extra: logObj.extra }),
      };

      console.log(JSON.stringify(logEntry));
    },
  };
}

// Create formatted reporter for development environments
function createFormattedReporter(service: string, loggerConfig: LoggerConfig) {
  return {
    log: (logObj: any) => {
      const timestamp = formatTimestamp();
      let level: LogLevelType;

      // Map consola levels to our custom levels
      if (logObj.type === 'info' || logObj.type === 'log') {
        level = LogLevel.Info;
      } else if (logObj.type === 'warn') {
        level = LogLevel.Warn;
      } else if (logObj.type === 'error') {
        level = LogLevel.Error;
      } else if (logObj.type === 'success') {
        level = LogLevel.Success;
      } else if (logObj.type === 'debug') {
        level = LogLevel.Debug;
      } else {
        level = LogLevel.Info;
      }

      // Check if this log level should be shown
      if (level < loggerConfig.minLevel!) {
        return;
      }

      const icon = getIcon(level);
      const color = getColor(level);
      const reset = isBrowser() ? '' : '\x1b[0m';
      const levelName = getLevelName(level);

      const formatted = `${timestamp} [${service}] ${color}${icon}${reset} ${levelName} ${logObj.args.join(' ')}`;
      console.log(formatted);
    },
  };
}

export function createLogger(service: string, config?: Partial<LoggerConfig>): CustomLogger {
  const loggerConfig = { ...getLoggerConfig(), ...config };

  // Choose reporter based on environment
  const reporter = loggerConfig.useJsonOutput 
    ? createJsonReporter(service, loggerConfig)
    : createFormattedReporter(service, loggerConfig);

  // Ensure process.env exists for Consola (browser compatibility)
  if (typeof globalThis.process === 'undefined') {
    (globalThis as any).process = { env: {} };
  }

  const consola = createConsola({
    reporters: [reporter],
  });

  const logMessage = (level: LogLevelType, message: string, extra?: any) => {
    if (level < loggerConfig.minLevel!) {
      return;
    }

    if (loggerConfig.useJsonOutput) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        service,
        level: getLevelName(level).toLowerCase(),
        message,
        ...(extra && { extra }),
      };
      console.log(JSON.stringify(logEntry));
    } else {
      const timestamp = formatTimestamp();
      const icon = getIcon(level);
      const color = getColor(level);
      const reset = isBrowser() ? '' : '\x1b[0m';
      const levelName = getLevelName(level);

      const formatted = `${timestamp} [${service}] ${color}${icon}${reset} ${levelName} ${message}`;
      console.log(formatted);
    }
  };

  return {
    info: (message: string) => consola.info(message),
    warn: (message: string) => consola.warn(message),
    error: (message: string) => consola.error(message),
    success: (message: string) => consola.success(message),
    debug: (message: string) => {
      if (loggerConfig.enableDebug) {
        logMessage(LogLevel.Debug, message);
      }
    },
    env: (envName: string, value?: string | boolean | null) => {
      if (loggerConfig.enableEnvLogging) {
        let displayValue = '[MISSING]';
        if (value === true || value === 'true') {
          displayValue = '[CONFIGURED]';
        } else if (value === false || value === 'false') {
          displayValue = '[DISABLED]';
        } else if (value && typeof value === 'string') {
          // Mask sensitive values
          if (
            envName.toLowerCase().includes('secret') ||
            envName.toLowerCase().includes('key') ||
            envName.toLowerCase().includes('password') ||
            envName.toLowerCase().includes('token')
          ) {
            displayValue = '[REDACTED]';
          } else if (envName.toLowerCase().includes('url') && value.length > 50) {
            displayValue = `${value.substring(0, 50)}...`;
          } else {
            displayValue = value;
          }
        }
        logMessage(LogLevel.Env, `${envName}: ${displayValue}`, { envName, value: displayValue });
      }
    },
    startup: (message: string) => {
      if (loggerConfig.enableStartupLogging) {
        logMessage(LogLevel.Startup, message);
      }
    },
  };
}

// Pre-configured loggers for common services
export const serverLogger = createLogger('server');
export const dbLogger = createLogger('db');
export const authLogger = createLogger('auth');
export const frontendLogger = createLogger('frontend');
export const apiLogger = createLogger('api');
export const devLogger = createLogger('dev', {
  enableDebug: true,
  enableEnvLogging: true,
  enableStartupLogging: true,
});

// Utility function for environment logging
export function logEnvironment(logger: CustomLogger = devLogger) {
  // Only log environment variables in Node.js
  if (typeof process === 'undefined' || !process.env) {
    logger.startup('Environment Configuration (Browser - skipping env vars)');
    return;
  }

  const requiredEnvs = [
    'NODE_ENV',
    'DATABASE_URL',
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL',
    'NITRO_PORT',
    'VITE_API_URL',
  ];

  logger.startup('Environment Configuration');

  requiredEnvs.forEach((envName) => {
    const value = process.env[envName];
    logger.env(envName, value || null);
  });
}

// Export types for external use
export type { CustomLogger, LoggerConfig };
export { LogLevel };
