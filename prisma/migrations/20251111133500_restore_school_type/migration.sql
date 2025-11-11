-- Reintroduce the `type` column on schools, stored as text
ALTER TABLE "public"."schools"
    ADD COLUMN "type" TEXT NOT NULL DEFAULT 'general';

-- Ensure existing rows have a value before removing default (keep default for safety)
UPDATE "public"."schools"
SET "type" = COALESCE(NULLIF("type", ''), 'general');

