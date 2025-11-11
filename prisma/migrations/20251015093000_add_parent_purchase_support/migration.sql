-- CreateEnum
CREATE TYPE "public"."BuyerType" AS ENUM ('STUDENT', 'PARENT');

ALTER TABLE "public"."digital_purchases" ADD COLUMN "buyerId" TEXT;

-- Backfill existing purchases: set buyerId to student's userId
UPDATE "public"."digital_purchases" dp
SET "buyerId" = s."userId"
FROM "public"."students" s
WHERE dp."studentId" = s.id AND dp."buyerId" IS NULL;

ALTER TABLE "public"."digital_purchases" 
    ADD COLUMN "buyerType" "public"."BuyerType" NOT NULL DEFAULT 'STUDENT',
    ADD COLUMN "giftMessage" TEXT;

-- Make buyerId required and drop default after backfilling
ALTER TABLE "public"."digital_purchases" 
    ALTER COLUMN "buyerId" SET NOT NULL,
    ALTER COLUMN "buyerType" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "public"."digital_purchases" ADD CONSTRAINT "digital_purchases_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

