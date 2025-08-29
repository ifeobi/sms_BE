/*
  Warnings:

  - The values [PRIMARY] on the enum `SchoolType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."SchoolType_new" AS ENUM ('ELEMENTARY', 'SECONDARY', 'TERTIARY');
ALTER TABLE "public"."schools" ALTER COLUMN "type" TYPE "public"."SchoolType_new" USING ("type"::text::"public"."SchoolType_new");
ALTER TYPE "public"."SchoolType" RENAME TO "SchoolType_old";
ALTER TYPE "public"."SchoolType_new" RENAME TO "SchoolType";
DROP TYPE "public"."SchoolType_old";
COMMIT;
