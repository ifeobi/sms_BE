-- Refactor CAComponentGrade to store all CA scores in JSON field
-- Remove: componentType, componentName, maxScore, score
-- Add: caScores (JSON field)
-- Update unique constraint to remove componentType

-- Step 1: Add caScores column (nullable initially)
ALTER TABLE "public"."ca_component_grades" ADD COLUMN "caScores" JSONB;

-- Step 2: Migrate existing data to JSON format
-- Group by studentId, subjectId, classId, termId and combine into JSON
DO $$
DECLARE
    student_record RECORD;
    ca_json JSONB;
    exam_score DOUBLE PRECISION;
    exam_grade TEXT;
BEGIN
    -- For each unique student/subject/class/term combination
    FOR student_record IN 
        SELECT DISTINCT "studentId", "subjectId", "classId", "termId"
        FROM "public"."ca_component_grades"
    LOOP
        ca_json := '{}'::JSONB;
        
        -- Collect all CA scores for this student/subject/class/term
        FOR rec IN 
            SELECT "componentType", "score", "grade"
            FROM "public"."ca_component_grades"
            WHERE "studentId" = student_record."studentId"
              AND "subjectId" = student_record."subjectId"
              AND "classId" = student_record."classId"
              AND "termId" = student_record."termId"
              AND "isActive" = true
        LOOP
            IF rec."componentType" = 'EXAM' THEN
                exam_score := rec."score";
                exam_grade := rec."grade";
            ELSIF rec."componentType" ~ '^CA\d+$' THEN
                -- Add CA score to JSON
                ca_json := ca_json || jsonb_build_object(rec."componentType", rec."score");
            END IF;
        END LOOP;
        
        -- Add exam to JSON if it exists
        IF exam_score IS NOT NULL THEN
            ca_json := ca_json || jsonb_build_object('EXAM', exam_score);
        END IF;
        
        -- Update all rows for this student/subject/class/term with the JSON
        -- We'll keep the first row and delete duplicates later
        UPDATE "public"."ca_component_grades"
        SET "caScores" = ca_json,
            "grade" = COALESCE(exam_grade, "grade")
        WHERE "studentId" = student_record."studentId"
          AND "subjectId" = student_record."subjectId"
          AND "classId" = student_record."classId"
          AND "termId" = student_record."termId"
          AND "id" = (
              SELECT "id" 
              FROM "public"."ca_component_grades"
              WHERE "studentId" = student_record."studentId"
                AND "subjectId" = student_record."subjectId"
                AND "classId" = student_record."classId"
                AND "termId" = student_record."termId"
              ORDER BY "recordedAt" ASC
              LIMIT 1
          );
    END LOOP;
END $$;

-- Step 3: Delete duplicate rows (keep only one per student/subject/class/term)
DELETE FROM "public"."ca_component_grades" a
USING "public"."ca_component_grades" b
WHERE a."id" > b."id"
  AND a."studentId" = b."studentId"
  AND a."subjectId" = b."subjectId"
  AND a."classId" = b."classId"
  AND a."termId" = b."termId";

-- Step 4: Drop old unique constraint
DROP INDEX IF EXISTS "ca_component_grades_studentId_subjectId_classId_termId_componentType_key";

-- Step 5: Drop componentType index
DROP INDEX IF EXISTS "ca_component_grades_componentType_idx";

-- Step 6: Remove old columns
ALTER TABLE "public"."ca_component_grades" 
  DROP COLUMN IF EXISTS "componentType",
  DROP COLUMN IF EXISTS "componentName",
  DROP COLUMN IF EXISTS "score",
  DROP COLUMN IF EXISTS "maxScore";

-- Step 7: Create new unique constraint (without componentType)
CREATE UNIQUE INDEX "ca_component_grades_studentId_subjectId_classId_termId_key" 
ON "public"."ca_component_grades"("studentId", "subjectId", "classId", "termId");

