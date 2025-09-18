/*
  Warnings:

  - You are about to drop the column `completeLevels` on the `school_academic_structures` table. All the data in the column will be lost.
  - You are about to drop the column `originalSelectedTypes` on the `school_academic_structures` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."school_academic_structures" DROP COLUMN "completeLevels",
DROP COLUMN "originalSelectedTypes",
ADD COLUMN     "commonClassLevels" JSONB;
