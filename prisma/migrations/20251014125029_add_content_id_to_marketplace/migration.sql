/*
  Warnings:

  - A unique constraint covering the columns `[contentId]` on the table `marketplace_items` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."marketplace_items" ADD COLUMN     "contentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "marketplace_items_contentId_key" ON "public"."marketplace_items"("contentId");
