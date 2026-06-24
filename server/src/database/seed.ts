import 'dotenv/config';
import { PrismaClient, ContactStatus, AdminRole, AdminStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding database...');

  const initialPassword = process.env['INITIAL_ADMIN_PASSWORD'];
  if (!initialPassword || initialPassword.trim() === '') {
    throw new Error('INITIAL_ADMIN_PASSWORD environment variable is required to run database seeding.');
  }

  const hashedPassword = await bcrypt.hash(initialPassword.trim(), 12);

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
    update: {
      hashedPassword,
      status: AdminStatus.ACTIVE,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      name: 'XIFOZ Admin',
      email: 'admin@xifoz.com',
      hashedPassword,
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
        phone: '+91 98765 43210',
        company: 'Acme Corp',
        service: 'Penetration Testing',
        message: 'We need an external penetration test performed on our web apps and cloud infrastructure.',
        status: ContactStatus.NEW,
      },
      {
        name: 'Jane Smith',
        email: 'jane@tech.io',
        phone: '+91 87654 32109',
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
