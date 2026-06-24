import { prisma } from '../config/database.js';
import type { ContactInput } from '../validators/contact.validator.js';

export async function createContactSubmission(data: ContactInput) {
  return prisma.contactSubmission.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
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

