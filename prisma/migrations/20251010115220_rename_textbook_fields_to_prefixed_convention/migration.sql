/*
  Warnings:

  - You are about to drop the column `author` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `edition` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `isbn` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `physicalPrice` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `publisher` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `content` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."content" DROP COLUMN "author",
DROP COLUMN "edition",
DROP COLUMN "isbn",
DROP COLUMN "physicalPrice",
DROP COLUMN "publisher",
DROP COLUMN "year",
ADD COLUMN     "textbookAuthor" TEXT,
ADD COLUMN     "textbookEdition" TEXT,
ADD COLUMN     "textbookIsbn" TEXT,
ADD COLUMN     "textbookPrice" DOUBLE PRECISION,
ADD COLUMN     "textbookPublisher" TEXT,
ADD COLUMN     "textbookYear" INTEGER;
