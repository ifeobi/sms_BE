-- Migrate any existing assignment scores from assignment_assignees back to academic_records
-- This ensures we don't lose any data before removing the columns
UPDATE "public"."academic_records" ar
SET 
    "caScore" = aa."assignmentScore",
    "maxcaScore" = aa."assignmentMaxScore"
FROM "public"."assignment_assignees" aa
WHERE 
    ar."assignmentId" = aa."assignmentId"
    AND ar."studentId" = aa."studentId"
    AND ar."assignmentId" IS NOT NULL
    AND aa."assignmentScore" IS NOT NULL
    AND (ar."caScore" IS NULL OR ar."maxcaScore" IS NULL);

-- Remove assignmentScore and assignmentMaxScore columns from assignment_assignees
ALTER TABLE "public"."assignment_assignees" 
DROP COLUMN IF EXISTS "assignmentScore",
DROP COLUMN IF EXISTS "assignmentMaxScore";

-- Note: All scores (assignment and CA) are now stored in academic_records.caScore/maxcaScore
-- Assignment scores have assignmentId NOT NULL
-- CA scores have assignmentId IS NULL

