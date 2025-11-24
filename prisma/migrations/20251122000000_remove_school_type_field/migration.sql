-- Remove the `type` column from schools table
-- Source of truth is now SchoolAcademicConfig.selectedLevels
ALTER TABLE "public"."schools"
    DROP COLUMN IF EXISTS "type";

