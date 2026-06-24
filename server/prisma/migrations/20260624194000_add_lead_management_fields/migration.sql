-- AlterTable
ALTER TABLE "contact_submissions" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "internalNotes" TEXT,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "contact_submissions_isDeleted_idx" ON "contact_submissions"("isDeleted");

-- CreateIndex
CREATE INDEX "contact_submissions_deletedAt_idx" ON "contact_submissions"("deletedAt");
