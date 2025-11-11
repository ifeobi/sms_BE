-- Align the creators table with the Prisma schema expectations
ALTER TABLE "public"."creators"
    ADD COLUMN "categories" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'free';

-- Remove the legacy bio column now stored on users
ALTER TABLE "public"."creators"
    DROP COLUMN IF EXISTS "bio";

