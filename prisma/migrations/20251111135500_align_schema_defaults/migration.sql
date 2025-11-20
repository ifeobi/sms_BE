-- Ensure MarketplaceCategory enum has all schema variants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum en
    JOIN pg_type ty ON en.enumtypid = ty.oid
    JOIN pg_namespace ns ON ty.typnamespace = ns.oid
    WHERE ns.nspname = 'public'
      AND ty.typname = 'marketplacecategory'
      AND en.enumlabel = 'EBOOK'
  ) THEN
    ALTER TYPE "public"."MarketplaceCategory" ADD VALUE 'EBOOK';
  END IF;
END $$;

-- Align content table defaults
ALTER TABLE "public"."content"
  ALTER COLUMN "contentType" SET DEFAULT 'DIGITAL'::"public"."ContentType",
  ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- Align updatedAt defaults on category tables
ALTER TABLE "public"."content_categories"
  ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "public"."subject_categories"
  ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- Ensure creators.categories has default empty array
ALTER TABLE "public"."creators"
  ALTER COLUMN "categories" SET DEFAULT ARRAY[]::TEXT[];

-- Maintain default school type
ALTER TABLE "public"."schools"
  ALTER COLUMN "type" SET DEFAULT 'general';

-- Reinstate unique index on school academic configs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'school_academic_configs_schoolId_key'
  ) THEN
    CREATE UNIQUE INDEX "school_academic_configs_schoolId_key"
      ON "public"."school_academic_configs"("schoolId");
  END IF;
END $$;

-- Refresh foreign keys on student_subject_enrollments to match Prisma schema
ALTER TABLE "public"."student_subject_enrollments"
  DROP CONSTRAINT IF EXISTS "student_subject_enrollments_classId_fkey",
  DROP CONSTRAINT IF EXISTS "student_subject_enrollments_subjectId_fkey",
  ADD CONSTRAINT "student_subject_enrollments_classId_fkey"
    FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "student_subject_enrollments_subjectId_fkey"
    FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Ensure the composite unique index name matches Prisma expectations
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'student_subject_enrollments_studentId_subjectId_academicYea_key'
  ) THEN
    DROP INDEX "public"."student_subject_enrollments_studentId_subjectId_academicYea_key";
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'student_subject_enrollments_studentId_subjectId_academicYear_key'
  ) THEN
    CREATE UNIQUE INDEX "student_subject_enrollments_studentId_subjectId_academicYear_key"
      ON "public"."student_subject_enrollments"("studentId", "subjectId", "academicYear");
  END IF;
END $$;

