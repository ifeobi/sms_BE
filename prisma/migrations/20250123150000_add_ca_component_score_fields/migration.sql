-- Add caComponentScore and caComponentMaxScore columns for CA records
ALTER TABLE "public"."academic_records" 
ADD COLUMN IF NOT EXISTS "caComponentScore" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "caComponentMaxScore" DOUBLE PRECISION;

-- Migrate existing CA scores from percentage/caScore to caComponentScore
-- CA records have assignmentId IS NULL and feedback starts with 'CA_'
UPDATE "public"."academic_records" 
SET 
    "caComponentScore" = COALESCE("caScore", "percentage"),
    "caComponentMaxScore" = CASE 
        WHEN "feedback" LIKE '%EXAM%' THEN 60
        ELSE 10
    END
WHERE 
    "assignmentId" IS NULL
    AND "feedback" LIKE 'CA_%'
    AND ("caComponentScore" IS NULL OR "caComponentMaxScore" IS NULL);

-- Clear caScore/maxcaScore from CA records (they should only be used for assignments)
UPDATE "public"."academic_records"
SET 
    "caScore" = NULL,
    "maxcaScore" = NULL
WHERE 
    "assignmentId" IS NULL
    AND "feedback" LIKE 'CA_%';

-- Note: 
-- - caScore/maxcaScore are ONLY for assignment records (assignmentId NOT NULL)
-- - caComponentScore/caComponentMaxScore are ONLY for CA records (assignmentId IS NULL)

