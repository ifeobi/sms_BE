-- Migrate assignment grades from academic_records to assignment_grades
-- Handle both cases: with and without feedback column
DO $$
BEGIN
    -- Check if feedback column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'academic_records' 
        AND column_name = 'feedback'
    ) THEN
        -- Migrate with feedback column
        INSERT INTO "public"."assignment_grades" (
          "id", "assignmentId", "studentId", "teacherId", "subjectId", "classId", "termId",
          "score", "maxScore", "grade", "percentage", "gpa", "feedback",
          "isLate", "latePenaltyApplied", "resubmissionCount",
          "gradedAt", "recordedAt", "recordedBy", "lastModified", "modifiedBy",
          "isActive", "isPublished", "publishedAt", "attemptNumber"
        )
        SELECT 
          "id", 
          "assignmentId", 
          "studentId", 
          "teacherId", 
          "subjectId", 
          "classId", 
          "termId",
          "assignmentScore" as "score",
          "assignmentMaxScore" as "maxScore",
          "grade", 
          "percentage", 
          "gpa", 
          "feedback",
          "isLate", 
          "latePenaltyApplied", 
          "resubmissionCount",
          "gradedAt", 
          "recordedAt", 
          "recordedBy", 
          "lastModified", 
          "modifiedBy",
          "isActive", 
          "isPublished", 
          "publishedAt",
          1 as "attemptNumber" -- Default to attempt 1
        FROM "public"."academic_records"
        WHERE "assignmentId" IS NOT NULL
          AND ("assignmentScore" IS NOT NULL OR "assignmentMaxScore" IS NOT NULL)
        ON CONFLICT DO NOTHING;
    ELSE
        -- Migrate without feedback column
        INSERT INTO "public"."assignment_grades" (
          "id", "assignmentId", "studentId", "teacherId", "subjectId", "classId", "termId",
          "score", "maxScore", "grade", "percentage", "gpa",
          "isLate", "latePenaltyApplied", "resubmissionCount",
          "gradedAt", "recordedAt", "recordedBy", "lastModified", "modifiedBy",
          "isActive", "isPublished", "publishedAt", "attemptNumber"
        )
        SELECT 
          "id", 
          "assignmentId", 
          "studentId", 
          "teacherId", 
          "subjectId", 
          "classId", 
          "termId",
          "assignmentScore" as "score",
          "assignmentMaxScore" as "maxScore",
          "grade", 
          "percentage", 
          "gpa",
          "isLate", 
          "latePenaltyApplied", 
          "resubmissionCount",
          "gradedAt", 
          "recordedAt", 
          "recordedBy", 
          "lastModified", 
          "modifiedBy",
          "isActive", 
          "isPublished", 
          "publishedAt",
          1 as "attemptNumber" -- Default to attempt 1
        FROM "public"."academic_records"
        WHERE "assignmentId" IS NOT NULL
          AND ("assignmentScore" IS NOT NULL OR "assignmentMaxScore" IS NOT NULL)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Migrate CA component grades from academic_records to ca_component_grades
-- Handle both cases: with and without feedback column
DO $$
BEGIN
    -- Check if feedback column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'academic_records' 
        AND column_name = 'feedback'
    ) THEN
        -- Migrate CA records identified by feedback column
        INSERT INTO "public"."ca_component_grades" (
          "id", "studentId", "teacherId", "subjectId", "classId", "termId",
          "componentType", "componentName",
          "score", "maxScore", "grade", "percentage", "gpa", "feedback",
          "gradedAt", "recordedAt", "recordedBy", "lastModified", "modifiedBy",
          "isActive", "isPublished", "publishedAt"
        )
        SELECT 
          "id", 
          "studentId", 
          "teacherId", 
          "subjectId", 
          "classId", 
          "termId",
          REPLACE("feedback", 'CA_', '') as "componentType", -- Extract "CA1", "CA2", "EXAM" from "CA_CA1", "CA_EXAM"
          NULL as "componentName", -- Can be populated from AssessmentStructure later
          "caComponentScore" as "score",
          "caComponentMaxScore" as "maxScore",
          "grade", 
          "percentage", 
          "gpa", 
          "feedback",
          "gradedAt", 
          "recordedAt", 
          "recordedBy", 
          "lastModified", 
          "modifiedBy",
          "isActive", 
          "isPublished", 
          "publishedAt"
        FROM "public"."academic_records"
        WHERE "assignmentId" IS NULL
          AND "feedback" LIKE 'CA_%'
          AND ("caComponentScore" IS NOT NULL OR "caComponentMaxScore" IS NOT NULL)
        ON CONFLICT DO NOTHING;
    ELSE
        -- If feedback column doesn't exist, migrate CA records based on assignmentId IS NULL
        -- Use a default componentType since we can't extract it from feedback
        INSERT INTO "public"."ca_component_grades" (
          "id", "studentId", "teacherId", "subjectId", "classId", "termId",
          "componentType", "componentName",
          "score", "maxScore", "grade", "percentage", "gpa",
          "gradedAt", "recordedAt", "recordedBy", "lastModified", "modifiedBy",
          "isActive", "isPublished", "publishedAt"
        )
        SELECT 
          "id", 
          "studentId", 
          "teacherId", 
          "subjectId", 
          "classId", 
          "termId",
          'CA1' as "componentType", -- Default component type
          NULL as "componentName",
          "caComponentScore" as "score",
          "caComponentMaxScore" as "maxScore",
          "grade", 
          "percentage", 
          "gpa",
          "gradedAt", 
          "recordedAt", 
          "recordedBy", 
          "lastModified", 
          "modifiedBy",
          "isActive", 
          "isPublished", 
          "publishedAt"
        FROM "public"."academic_records"
        WHERE "assignmentId" IS NULL
          AND ("caComponentScore" IS NOT NULL OR "caComponentMaxScore" IS NOT NULL)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Note: academic_records table is kept for now during transition period
-- It will be removed in a future migration after verifying data migration

