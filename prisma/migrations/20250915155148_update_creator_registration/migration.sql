/*
  Warnings:

  - You are about to drop the column `bio` on the `creators` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."creators" DROP COLUMN "bio",
ADD COLUMN     "categories" TEXT[],
ADD COLUMN     "plan" TEXT NOT NULL DEFAULT 'free';

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "website" TEXT;
