import { prisma } from '@repo/database';
import { authLogger } from '@repo/logger';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

// Initialize auth with comprehensive logging
authLogger.info('Initializing Better Auth configuration');

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
    generateId: () => crypto.randomUUID().replace(/-/g, ''),
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
        required: false,
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET || (() => { throw new Error('BETTER_AUTH_SECRET is required'); })(),
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(',') || ['http://localhost:5173'],
  hooks: {
    before: [
      {
        matcher: (context: any) => true, // Log all operations
        handler: async (request: any, context: any) => {
          const startTime = Date.now();
          const method = context.method || 'unknown';
          const endpoint = context.endpoint || 'unknown';

          authLogger.debug(`Starting auth operation: ${method} ${endpoint}`);

          // Store start time in context for duration calculation
          context.metadata = { ...context.metadata, startTime };

          return { request, context };
        },
      },
    ],
    after: [
      {
        matcher: (context: any) => true, // Log all operations
        handler: async (request: any, response: any, context: any) => {
          const startTime = context.metadata?.startTime || Date.now();
          const duration = Date.now() - startTime;
          const method = context.method || 'unknown';
          const endpoint = context.endpoint || 'unknown';
          const success = response.status >= 200 && response.status < 400;

          if (success) {
            authLogger.info(`Auth operation completed: ${method} ${endpoint} (${duration}ms)`);
          } else {
            authLogger.warn(
              `Auth operation failed: ${method} ${endpoint} (${duration}ms) - Status: ${response.status}`
            );
          }

          // Log user context if available
          if (context.session?.userId) {
            authLogger.debug(`Operation for user: ${context.session.userId}`);
          }

          return { request, response, context };
        },
      },
    ],
  },
});

authLogger.success('Better Auth initialized successfully');

export type AuthSession = {
  user: { id: string; email: string; name?: string };
  session: { id: string; createdAt: string };
};
