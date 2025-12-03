-- Remove maxScore and instructions columns from Assignment table
-- maxScore is now only stored in AssignmentGrade table
-- instructions field is removed, description field serves both purposes

ALTER TABLE "assignments" DROP COLUMN IF EXISTS "maxScore";
ALTER TABLE "assignments" DROP COLUMN IF EXISTS "instructions";

