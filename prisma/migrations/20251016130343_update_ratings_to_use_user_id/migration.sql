/*
  Warnings:

  - You are about to drop the column `studentId` on the `product_ratings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,marketplaceItemId]` on the table `product_ratings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `product_ratings` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."product_ratings" DROP CONSTRAINT "product_ratings_studentId_fkey";

-- DropIndex
DROP INDEX "public"."product_ratings_studentId_marketplaceItemId_key";

-- AlterTable
ALTER TABLE "public"."product_ratings" DROP COLUMN "studentId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "product_ratings_userId_marketplaceItemId_key" ON "public"."product_ratings"("userId", "marketplaceItemId");

-- AddForeignKey
ALTER TABLE "public"."product_ratings" ADD CONSTRAINT "product_ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
