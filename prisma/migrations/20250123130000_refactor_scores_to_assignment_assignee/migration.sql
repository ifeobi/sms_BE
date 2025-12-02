-- Add caScore and maxcaScore columns to academic_records if they don't exist (for CA records)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'academic_records' AND column_name = 'caScore'
    ) THEN
        ALTER TABLE "public"."academic_records" ADD COLUMN "caScore" DOUBLE PRECISION;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'academic_records' AND column_name = 'maxcaScore'
    ) THEN
        ALTER TABLE "public"."academic_records" ADD COLUMN "maxcaScore" DOUBLE PRECISION;
    END IF;
END $$;

-- Migrate existing assignment scores from academic_records to assignment_assignees
-- Only migrate records that have an assignmentId (assignment-related grades)
UPDATE "public"."assignment_assignees" aa
SET 
    "assignmentScore" = ar."caScore",
    "assignmentMaxScore" = ar."maxcaScore"
FROM "public"."academic_records" ar
WHERE 
    aa."assignmentId" = ar."assignmentId"
    AND aa."studentId" = ar."studentId"
    AND ar."assignmentId" IS NOT NULL
    AND ar."caScore" IS NOT NULL
    AND (aa."assignmentScore" IS NULL OR aa."assignmentMaxScore" IS NULL);

-- Note: CA records (assignmentId IS NULL) will continue to use caScore/maxcaScore in academic_records
-- Assignment records will now use assignmentScore/assignmentMaxScore in assignment_assignees

