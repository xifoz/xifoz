import { prisma } from '../config/database.js';
import type { Prisma, Admin } from '@prisma/client';

/**
 * Finds an active, non-deleted admin by their email address.
 * @param email The email to query.
 * @returns The Admin object or null if not found.
 */
export async function findAdminByEmail(email: string): Promise<Admin | null> {
  return prisma.admin.findFirst({
    where: {
      email,
      deletedAt: null,
    },
  });
}

/**
 * Finds an active, non-deleted admin by their ID.
 * @param id The admin's unique ID.
 * @returns The Admin object or null if not found.
 */
export async function findAdminById(id: string): Promise<Admin | null> {
  return prisma.admin.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });
}

/**
 * Updates an admin's profile or status fields (e.g. failed login attempts, locking/unlocking, last login).
 * @param id The admin's ID.
 * @param data The fields to update.
 * @returns The updated Admin object.
 */
export async function updateAdmin(id: string, data: Prisma.AdminUpdateInput): Promise<Admin> {
  return prisma.admin.update({
    where: { id },
    data,
  });
}
