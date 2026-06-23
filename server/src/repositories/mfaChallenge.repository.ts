import { prisma } from '../config/database.js';
import type { Prisma, MfaChallenge } from '@prisma/client';

function getClient(tx?: Prisma.TransactionClient) {
  return tx || prisma;
}

/**
 * Creates a new MFA challenge in the database.
 */
export async function createMfaChallenge(
  data: {
    adminId: string;
    hashedToken: string;
    expiresAt: Date;
  },
  tx?: Prisma.TransactionClient
): Promise<MfaChallenge> {
  return getClient(tx).mfaChallenge.create({
    data: {
      adminId: data.adminId,
      hashedToken: data.hashedToken,
      expiresAt: data.expiresAt,
    },
  });
}

/**
 * Finds an MFA challenge by its hashed token.
 */
export async function findMfaChallenge(
  hashedToken: string,
  tx?: Prisma.TransactionClient
): Promise<MfaChallenge | null> {
  return getClient(tx).mfaChallenge.findUnique({
    where: { hashedToken },
  });
}

/**
 * Deletes a specific MFA challenge by ID.
 */
export async function deleteMfaChallenge(
  id: string,
  tx?: Prisma.TransactionClient
): Promise<MfaChallenge> {
  return getClient(tx).mfaChallenge.delete({
    where: { id },
  });
}

/**
 * Deletes all expired MFA challenges from the database.
 */
export async function deleteExpiredMfaChallenges(
  tx?: Prisma.TransactionClient
): Promise<Prisma.BatchPayload> {
  return getClient(tx).mfaChallenge.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
}
