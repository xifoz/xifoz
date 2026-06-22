import { prisma } from '../config/database.js';
import type { Prisma, Session, Admin } from '@prisma/client';

export type SessionWithAdmin = Session & { admin: Admin };

/**
 * Creates a new session in the database.
 * @param data The session creation attributes.
 * @returns The created Session object.
 */
export async function createSession(data: {
  adminId: string;
  hashedToken: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: Date;
}): Promise<Session> {
  return prisma.session.create({
    data: {
      adminId: data.adminId,
      hashedToken: data.hashedToken,
      userAgent: data.userAgent ?? null,
      ipAddress: data.ipAddress ?? null,
      expiresAt: data.expiresAt,
    },
  });
}

/**
 * Finds a unique session by its SHA-256 hashed refresh token, including the owner admin.
 * @param hashedToken The SHA-256 hashed token string.
 * @returns The Session with nested Admin, or null if not found.
 */
export async function findSession(hashedToken: string): Promise<SessionWithAdmin | null> {
  return prisma.session.findUnique({
    where: {
      hashedToken,
    },
    include: {
      admin: true,
    },
  });
}

/**
 * Updates an existing session by ID (e.g. setting new hashedToken, new expiry).
 * @param id The session ID.
 * @param data The update fields.
 * @returns The updated Session object.
 */
export async function updateSession(id: string, data: Prisma.SessionUpdateInput): Promise<Session> {
  return prisma.session.update({
    where: { id },
    data,
  });
}

/**
 * Revokes a session by ID (setting revokedAt to current timestamp).
 * @param id The session ID to revoke.
 * @returns The updated Session object.
 */
export async function revokeSession(id: string): Promise<Session> {
  return prisma.session.update({
    where: { id },
    data: {
      revokedAt: new Date(),
    },
  });
}

/**
 * Revokes all unexpired, active sessions for a specific admin.
 * @param adminId The ID of the admin.
 * @returns The Prisma batch update payload.
 */
export async function revokeAllSessions(adminId: string): Promise<Prisma.BatchPayload> {
  return prisma.session.updateMany({
    where: {
      adminId,
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

/**
 * Cleans up (deletes) all expired or explicitly revoked sessions from the database.
 * @returns The Prisma batch delete payload.
 */
export async function cleanupExpiredSessions(): Promise<Prisma.BatchPayload> {
  return prisma.session.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { revokedAt: { not: null } },
      ],
    },
  });
}
