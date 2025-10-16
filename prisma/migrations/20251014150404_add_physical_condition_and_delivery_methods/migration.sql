-- AlterTable
ALTER TABLE "public"."content" ADD COLUMN     "deliveryMethods" JSONB,
ADD COLUMN     "physicalCondition" TEXT;

-- AddForeignKey
ALTER TABLE "public"."marketplace_items" ADD CONSTRAINT "marketplace_items_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."content"("id") ON DELETE SET NULL ON UPDATE CASCADE;
