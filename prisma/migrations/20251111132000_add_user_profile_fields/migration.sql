-- Add optional profile fields expected by Prisma schema
ALTER TABLE "public"."users"
    ADD COLUMN "bio" TEXT,
    ADD COLUMN "country" TEXT,
    ADD COLUMN "website" TEXT,
    ADD COLUMN "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;

-- Ensure existing rows get a concrete value before removing default (if desired later)
UPDATE "public"."users"
SET "isEmailVerified" = COALESCE("isEmailVerified", false);

