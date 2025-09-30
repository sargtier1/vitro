import { dbLogger } from '@repo/logger';
import { prisma } from '../src/index.js';

async function main() {
  dbLogger.startup('Starting database seed...');

  try {
    // Add your seed data here
    const user = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin User',
        emailVerified: true,
      },
    });

    dbLogger.success(`Seed completed successfully: ${JSON.stringify(user, null, 2)}`);
  } catch (error) {
    dbLogger.error(`Seed failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

main()
  .catch((e) => {
    dbLogger.error(`Unhandled error during seed: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
