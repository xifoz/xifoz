-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditEvent" ADD VALUE 'MFA_ENABLED';
ALTER TYPE "AuditEvent" ADD VALUE 'MFA_DISABLED';
ALTER TYPE "AuditEvent" ADD VALUE 'MFA_QR_GENERATED';
ALTER TYPE "AuditEvent" ADD VALUE 'MFA_VERIFY_SUCCESS';
ALTER TYPE "AuditEvent" ADD VALUE 'MFA_VERIFY_FAILED';
ALTER TYPE "AuditEvent" ADD VALUE 'MFA_BACKUP_CODE_USED';
ALTER TYPE "AuditEvent" ADD VALUE 'MFA_BACKUP_REGENERATED';
ALTER TYPE "AuditEvent" ADD VALUE 'MFA_CHALLENGE_INVALID';
ALTER TYPE "AuditEvent" ADD VALUE 'MFA_CHALLENGE_EXPIRED';
ALTER TYPE "AuditEvent" ADD VALUE 'MFA_FAILURE_LOCKOUT';

-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "backupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tempTwoFactorIv" TEXT,
ADD COLUMN     "tempTwoFactorSecret" TEXT,
ADD COLUMN     "tempTwoFactorTag" TEXT,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorIv" TEXT,
ADD COLUMN     "twoFactorSecret" TEXT,
ADD COLUMN     "twoFactorTag" TEXT;

-- CreateTable
CREATE TABLE "mfa_challenges" (
    "id" TEXT NOT NULL,
    "hashedToken" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mfa_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trusted_devices" (
    "id" TEXT NOT NULL,
    "hashedDeviceToken" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "deviceName" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trusted_devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mfa_challenges_hashedToken_key" ON "mfa_challenges"("hashedToken");

-- CreateIndex
CREATE INDEX "mfa_challenges_expiresAt_idx" ON "mfa_challenges"("expiresAt");

-- CreateIndex
CREATE INDEX "mfa_challenges_adminId_idx" ON "mfa_challenges"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "trusted_devices_hashedDeviceToken_key" ON "trusted_devices"("hashedDeviceToken");

-- CreateIndex
CREATE INDEX "trusted_devices_adminId_idx" ON "trusted_devices"("adminId");

-- CreateIndex
CREATE INDEX "trusted_devices_expiresAt_idx" ON "trusted_devices"("expiresAt");

-- AddForeignKey
ALTER TABLE "mfa_challenges" ADD CONSTRAINT "mfa_challenges_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trusted_devices" ADD CONSTRAINT "trusted_devices_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
