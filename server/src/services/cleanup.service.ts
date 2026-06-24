import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

/**
 * Permanently deletes ContactSubmission records that have been soft-deleted
 * for more than 10 days. Called once at server startup — no interval or cron.
 */
export async function cleanupDeletedContacts(): Promise<{ count: number }> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 10);

  const { count } = await prisma.contactSubmission.deleteMany({
    where: {
      isDeleted: true,
      deletedAt: { lt: cutoff },
    },
  });

  if (count > 0) {
    await prisma.auditLog.create({
      data: {
        event: 'DELETE',
        actorName: 'System',
        details: `Auto-purged ${count} deleted contact${count === 1 ? '' : 's'} older than 10 days`,
        severity: 'INFO',
      },
    });

    logger.info(`Startup contact cleanup completed: permanently removed ${count} soft-deleted contact${count === 1 ? '' : 's'} older than 10 days`);
  }

  return { count };
}
