/*
  Warnings:

  - The values [BOTH,VIDEO,PAST_QUESTIONS,AUDIO_BOOK,INTERACTIVE] on the enum `ContentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ContentType_new" AS ENUM ('DIGITAL', 'PHYSICAL');
ALTER TABLE "public"."content" ALTER COLUMN "contentType" TYPE "public"."ContentType_new" USING ("contentType"::text::"public"."ContentType_new");
ALTER TYPE "public"."ContentType" RENAME TO "ContentType_old";
ALTER TYPE "public"."ContentType_new" RENAME TO "ContentType";
DROP TYPE "public"."ContentType_old";
COMMIT;
