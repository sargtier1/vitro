import { prisma } from '../src/index.js';

async function main() {
  console.log('Starting database seed...');

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

    console.log('Seed completed successfully:', user);
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Unhandled error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
