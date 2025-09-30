import { prisma } from '@repo/database';
import { authLogger } from '@repo/logger';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

// Initialize auth
authLogger.startup('Initializing Better Auth configuration');

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
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
  // Simplified hooks configuration
  // hooks: {
  //   // Add custom hooks here if needed
  // },
});

authLogger.success('Better Auth initialized successfully');

export type AuthSession = {
  user: { id: string; email: string; name?: string };
  session: { id: string; createdAt: string };
};
