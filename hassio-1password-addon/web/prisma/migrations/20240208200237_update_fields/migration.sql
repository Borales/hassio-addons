-- AlterTable
ALTER TABLE "ha_secrets" ADD COLUMN "is_skipped" BOOLEAN DEFAULT false;
ALTER TABLE "ha_secrets" ADD COLUMN "updated_at" DATETIME;
