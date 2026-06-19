import { prisma } from '../config/database.js';
import type { ContactInput } from '../validators/contact.validator.js';

export async function createContactSubmission(data: ContactInput) {
  return prisma.contactSubmission.create({
    data: {
      name: data.name,
      email: data.email,
      company: data.company ?? null,
      service: data.service ?? null,
      message: data.message,
    },
    select: {
      id: true,
      createdAt: true,
    },
  });
}

export async function listContactSubmissions(page = 1, perPage = 20) {
  const skip = (page - 1) * perPage;
  const [items, total] = await Promise.all([
    prisma.contactSubmission.findMany({
      skip,
      take: perPage,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.contactSubmission.count(),
  ]);
  return { items, total, page, perPage };
}
