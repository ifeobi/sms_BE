/*
  Warnings:

  - A unique constraint covering the columns `[imageKitFileId]` on the table `content_files` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "public"."FileType" ADD VALUE 'VIDEO';

-- AlterTable
ALTER TABLE "public"."content_files" ADD COLUMN     "imageKitFileId" TEXT,
ADD COLUMN     "imageKitUrl" TEXT,
ADD COLUMN     "isProcessed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "thumbnailUrl" TEXT,
ADD COLUMN     "videoDuration" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "content_files_imageKitFileId_key" ON "public"."content_files"("imageKitFileId");
