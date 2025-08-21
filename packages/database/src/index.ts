import { PrismaClient } from '@prisma/client';
import { dbLogger } from '@repo/logger';

// Lazy initialization to ensure runtime execution
let prismaInstance: PrismaClient | null = null;

function createPrisma() {
  dbLogger.info('Initializing Prisma client');

  if (!process.env.DATABASE_URL) {
    dbLogger.error('DATABASE_URL is required for Prisma');
    throw new Error('DATABASE_URL is required for Prisma');
  }

  dbLogger.info('Creating Prisma client with database connection');
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export function getPrisma() {
  if (!prismaInstance) {
    dbLogger.info('Getting Prisma instance');
    prismaInstance = createPrisma();
    dbLogger.success('Prisma client ready');
  }
  return prismaInstance;
}

// Export with lazy initialization
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const instance = getPrisma();
    const value = instance[prop as keyof PrismaClient];

    // Bind methods to maintain context
    if (typeof value === 'function') {
      return value.bind(instance);
    }

    return value;
  },
});

// Export types and common Prisma exports explicitly for better interop
export type {
  PrismaClient,
  User,
  Account,
  Session,
  Verification,
  Post,
} from '@prisma/client';

// Re-export common Prisma utilities
export { Prisma } from '@prisma/client';
