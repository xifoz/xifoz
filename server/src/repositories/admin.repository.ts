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

export interface FindAdminsOptions {
  page: number;
  limit: number;
  search?: string;
  sort?: 'createdAt' | 'lastLoginAt' | 'name';
}

export interface AdminListItem {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SECURITY_ADMIN' | 'READ_ONLY';
  status: 'ACTIVE' | 'LOCKED' | 'DISABLED';
  createdAt: Date;
  lastLoginAt: Date | null;
}

export interface FindAdminsResult {
  items: AdminListItem[];
  total: number;
}

/**
 * Finds and filters admins with pagination, search, and sorting.
 * @param options Query and filter options.
 * @returns An object containing the paginated list of admins and the total matching count.
 */
export async function findAdmins(options: FindAdminsOptions): Promise<FindAdminsResult> {
  const { page, limit, search, sort } = options;
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    deletedAt: null,
  };

  if (search && search.trim() !== '') {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
  if (sort === 'name') {
    orderBy = { name: 'asc' };
  } else if (sort === 'lastLoginAt') {
    orderBy = { lastLoginAt: 'desc' };
  } else if (sort === 'createdAt') {
    orderBy = { createdAt: 'desc' };
  }

  const [admins, total] = await Promise.all([
    prisma.admin.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lockedUntil: true,
        createdAt: true,
        lastLoginAt: true,
      },
    }),
    prisma.admin.count({
      where,
    }),
  ]);

  const now = new Date();

  const items = admins.map((admin) => {
    let computedStatus: 'ACTIVE' | 'LOCKED' | 'DISABLED' = 'ACTIVE';
    if (admin.status === 'INACTIVE') {
      computedStatus = 'DISABLED';
    } else if (admin.lockedUntil && admin.lockedUntil > now) {
      computedStatus = 'LOCKED';
    }

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role as 'SUPER_ADMIN' | 'SECURITY_ADMIN' | 'READ_ONLY',
      status: computedStatus,
      createdAt: admin.createdAt,
      lastLoginAt: admin.lastLoginAt,
    };
  });

  return {
    items,
    total,
  };
}
