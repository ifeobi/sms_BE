-- Remove unnecessary fields from academic_records table
-- These fields have been moved to assignment_grades and ca_component_grades tables

-- Drop columns that are no longer needed
ALTER TABLE "public"."academic_records" 
DROP COLUMN IF EXISTS "assignmentId",
DROP COLUMN IF EXISTS "grade",
DROP COLUMN IF EXISTS "percentage",
DROP COLUMN IF EXISTS "gpa",
DROP COLUMN IF EXISTS "feedback",
DROP COLUMN IF EXISTS "assignmentScore",
DROP COLUMN IF EXISTS "assignmentMaxScore",
DROP COLUMN IF EXISTS "caComponentScore",
DROP COLUMN IF EXISTS "caComponentMaxScore",
DROP COLUMN IF EXISTS "isLate",
DROP COLUMN IF EXISTS "latePenaltyApplied",
DROP COLUMN IF EXISTS "resubmissionCount",
DROP COLUMN IF EXISTS "gradedAt",
DROP COLUMN IF EXISTS "recordedAt",
DROP COLUMN IF EXISTS "recordedBy",
DROP COLUMN IF EXISTS "lastModified",
DROP COLUMN IF EXISTS "modifiedBy",
DROP COLUMN IF EXISTS "isActive",
DROP COLUMN IF EXISTS "isPublished",
DROP COLUMN IF EXISTS "publishedAt";

-- Note: The academic_records table is kept for now with minimal structure
-- It can be dropped entirely in a future migration after verifying all data has been migrated
-- to assignment_grades and ca_component_grades tables

