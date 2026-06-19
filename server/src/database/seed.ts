import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding database...');

  await prisma.contactSubmission.createMany({
    data: [
      {
        name: 'Test User',
        email: 'test@example.com',
        company: 'Example Corp',
        service: 'Penetration Testing',
        message: 'This is a seed entry for development purposes.',
      },
    ],
    skipDuplicates: true,
  });

  console.log('Seed complete.');
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
