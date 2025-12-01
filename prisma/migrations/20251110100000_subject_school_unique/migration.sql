-- Consolidate duplicate subjects per school before adding unique constraint
WITH duplicate_pairs AS (
  SELECT
    s."id",
    MIN(s."id") OVER (
      PARTITION BY s."schoolId", LOWER(TRIM(s."name"))
    ) AS keep_id
  FROM "subjects" s
)
UPDATE "teacher_assignments" ta
SET "subjectId" = dp.keep_id
FROM duplicate_pairs dp
WHERE ta."subjectId" = dp."id"
  AND dp."id" <> dp.keep_id;

WITH duplicate_pairs AS (
  SELECT
    s."id",
    MIN(s."id") OVER (
      PARTITION BY s."schoolId", LOWER(TRIM(s."name"))
    ) AS keep_id
  FROM "subjects" s
)
UPDATE "assignments" a
SET "subjectId" = dp.keep_id
FROM duplicate_pairs dp
WHERE a."subjectId" = dp."id"
  AND dp."id" <> dp.keep_id;

WITH duplicate_pairs AS (
  SELECT
    s."id",
    MIN(s."id") OVER (
      PARTITION BY s."schoolId", LOWER(TRIM(s."name"))
    ) AS keep_id
  FROM "subjects" s
)
UPDATE "academic_records" ar
SET "subjectId" = dp.keep_id
FROM duplicate_pairs dp
WHERE ar."subjectId" = dp."id"
  AND dp."id" <> dp.keep_id;

DO $$
BEGIN
  IF to_regclass('public.student_subject_enrollments') IS NOT NULL THEN
    WITH duplicate_pairs AS (
      SELECT
        s."id",
        MIN(s."id") OVER (
          PARTITION BY s."schoolId", LOWER(TRIM(s."name"))
        ) AS keep_id
      FROM "subjects" s
    )
    UPDATE "student_subject_enrollments" sse
    SET "subjectId" = dp.keep_id
    FROM duplicate_pairs dp
    WHERE sse."subjectId" = dp."id"
      AND dp."id" <> dp.keep_id;
  END IF;
END $$;

WITH duplicate_pairs AS (
  SELECT
    s."id",
    MIN(s."id") OVER (
      PARTITION BY s."schoolId", LOWER(TRIM(s."name"))
    ) AS keep_id
  FROM "subjects" s
)
DELETE FROM "_ClassToSubject" cts
USING duplicate_pairs dp
WHERE cts."B" = dp."id"
  AND dp."id" <> dp.keep_id
  AND EXISTS (
    SELECT 1
    FROM "_ClassToSubject" existing
    WHERE existing."A" = cts."A"
      AND existing."B" = dp.keep_id
  );

WITH duplicate_pairs AS (
  SELECT
    s."id",
    MIN(s."id") OVER (
      PARTITION BY s."schoolId", LOWER(TRIM(s."name"))
    ) AS keep_id
  FROM "subjects" s
)
UPDATE "_ClassToSubject" cts
SET "B" = dp.keep_id
FROM duplicate_pairs dp
WHERE cts."B" = dp."id"
  AND dp."id" <> dp.keep_id;

WITH duplicate_pairs AS (
  SELECT
    s."id",
    MIN(s."id") OVER (
      PARTITION BY s."schoolId", LOWER(TRIM(s."name"))
    ) AS keep_id
  FROM "subjects" s
)
DELETE FROM "subjects" s
USING duplicate_pairs dp
WHERE s."id" = dp."id"
  AND dp."id" <> dp.keep_id;

-- Add unique constraint to enforce one subject per school/name pair
CREATE UNIQUE INDEX IF NOT EXISTS "subjects_schoolId_name_key"
  ON "subjects"("schoolId", "name");

