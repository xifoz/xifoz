import { PrismaClient, ContactStatus, AdminRole, AdminStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding database...');

  // Seed settings singleton
  await prisma.systemSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      portalTitle: 'XIFOZ Admin Portal',
      rateLimit: 60,
      sessionTimeout: 7,
      notificationsEnabled: true,
    },
  });

  // Seed default super admin
  await prisma.admin.upsert({
    where: { email: 'admin@xifoz.com' },
    update: {},
    create: {
      name: 'XIFOZ Admin',
      email: 'admin@xifoz.com',
      hashedPassword: '$2b$10$E9A7wO3Y1lFj6e4S8rT.uXFm1H1G2L3M4N5O6P7Q8R9S0T1U2V3W', // Mock hashed password
      role: AdminRole.SUPER_ADMIN,
      status: AdminStatus.ACTIVE,
    },
  });

  // Seed contact submissions
  await prisma.contactSubmission.createMany({
    data: [
      {
        name: 'John Doe',
        email: 'john@company.com',
        company: 'Acme Corp',
        service: 'Penetration Testing',
        message: 'We need an external penetration test performed on our web apps and cloud infrastructure.',
        status: ContactStatus.NEW,
      },
      {
        name: 'Jane Smith',
        email: 'jane@tech.io',
        company: 'Tech Solutions LLC',
        service: 'Cloud Security',
        message: 'Interested in securing our AWS accounts and doing a vulnerability assessment.',
        status: ContactStatus.RESOLVED,
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
