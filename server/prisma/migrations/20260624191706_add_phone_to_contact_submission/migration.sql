-- Add phone column with a temporary default so existing rows get a value,
-- then drop the default so new rows must always supply the field.
ALTER TABLE "contact_submissions" ADD COLUMN "phone" TEXT NOT NULL DEFAULT 'Not provided';
ALTER TABLE "contact_submissions" ALTER COLUMN "phone" DROP DEFAULT;
