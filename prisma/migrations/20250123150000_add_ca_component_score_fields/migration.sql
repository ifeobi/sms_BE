-- Add caComponentScore and caComponentMaxScore columns for CA records
ALTER TABLE "public"."academic_records" 
ADD COLUMN IF NOT EXISTS "caComponentScore" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "caComponentMaxScore" DOUBLE PRECISION;

-- Migrate existing CA scores from percentage/caScore to caComponentScore
-- CA records have assignmentId IS NULL
-- Check if feedback column exists before using it
DO $$
BEGIN
    -- Only migrate if feedback column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'academic_records' 
        AND column_name = 'feedback'
    ) THEN
        -- Migrate CA records identified by feedback column
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
    ELSE
        -- If feedback column doesn't exist, migrate based on assignmentId IS NULL
        -- This handles cases where the column was already removed
        UPDATE "public"."academic_records" 
        SET 
            "caComponentScore" = COALESCE("caScore", "percentage"),
            "caComponentMaxScore" = 10 -- Default max score
        WHERE 
            "assignmentId" IS NULL
            AND ("caComponentScore" IS NULL OR "caComponentMaxScore" IS NULL);

        -- Clear caScore/maxcaScore from CA records
        UPDATE "public"."academic_records"
        SET 
            "caScore" = NULL,
            "maxcaScore" = NULL
        WHERE 
            "assignmentId" IS NULL;
    END IF;
END $$;

-- Note: 
-- - caScore/maxcaScore are ONLY for assignment records (assignmentId NOT NULL)
-- - caComponentScore/caComponentMaxScore are ONLY for CA records (assignmentId IS NULL)

