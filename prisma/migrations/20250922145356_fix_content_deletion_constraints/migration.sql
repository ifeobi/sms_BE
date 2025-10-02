-- DropForeignKey
ALTER TABLE "public"."content" DROP CONSTRAINT "content_contentCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."content" DROP CONSTRAINT "content_subjectCategoryId_fkey";

-- AlterTable
ALTER TABLE "public"."content" ALTER COLUMN "contentCategoryId" DROP NOT NULL,
ALTER COLUMN "subjectCategoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."content" ADD CONSTRAINT "content_contentCategoryId_fkey" FOREIGN KEY ("contentCategoryId") REFERENCES "public"."content_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."content" ADD CONSTRAINT "content_subjectCategoryId_fkey" FOREIGN KEY ("subjectCategoryId") REFERENCES "public"."subject_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
