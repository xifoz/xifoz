/*
  Warnings:

  - You are about to drop the column `backupCodes` on the `admins` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "admins" DROP COLUMN "backupCodes";

-- CreateTable
CREATE TABLE "backup_codes" (
    "id" TEXT NOT NULL,
    "hashedCode" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backup_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "backup_codes_hashedCode_key" ON "backup_codes"("hashedCode");

-- CreateIndex
CREATE INDEX "backup_codes_adminId_idx" ON "backup_codes"("adminId");

-- AddForeignKey
ALTER TABLE "backup_codes" ADD CONSTRAINT "backup_codes_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
