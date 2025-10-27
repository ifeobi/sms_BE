-- AlterTable
ALTER TABLE "public"."content" ADD COLUMN     "streamCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."digital_purchases" ADD COLUMN     "lastStreamedAt" TIMESTAMP(3),
ADD COLUMN     "streamCount" INTEGER NOT NULL DEFAULT 0;
