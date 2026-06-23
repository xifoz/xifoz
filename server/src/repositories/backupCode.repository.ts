import { prisma } from '../config/database.js';
import type { Prisma, BackupCode } from '@prisma/client';

function getClient(tx?: Prisma.TransactionClient) {
  return tx || prisma;
}

/**
 * Creates multiple hashed backup codes for an admin.
 */
export async function createBackupCodes(
  adminId: string,
  hashedCodes: string[],
  tx?: Prisma.TransactionClient
): Promise<Prisma.BatchPayload> {
  return getClient(tx).backupCode.createMany({
    data: hashedCodes.map((hashedCode) => ({
      adminId,
      hashedCode,
    })),
  });
}


/**
 * Deletes a backup code by ID.
 */
export async function deleteBackupCode(
  id: string,
  tx?: Prisma.TransactionClient
): Promise<BackupCode> {
  return getClient(tx).backupCode.delete({
    where: { id },
  });
}

/**
 * Deletes all backup codes for a specific admin.
 */
export async function deleteAllBackupCodes(
  adminId: string,
  tx?: Prisma.TransactionClient
): Promise<Prisma.BatchPayload> {
  return getClient(tx).backupCode.deleteMany({
    where: {
      adminId,
    },
  });
}
