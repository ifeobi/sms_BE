-- Safety check: only create the table if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'student_subject_enrollments'
  ) THEN
    CREATE TABLE "public"."student_subject_enrollments" (
      "id" TEXT NOT NULL,
      "studentId" TEXT NOT NULL,
      "classId" TEXT NOT NULL,
      "subjectId" TEXT NOT NULL,
      "teacherAssignmentId" TEXT,
      "academicYear" TEXT NOT NULL,
      "termId" TEXT,
      "isElective" BOOLEAN NOT NULL DEFAULT false,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "student_subject_enrollments_pkey" PRIMARY KEY ("id")
    );

    -- Foreign key constraints
    ALTER TABLE "public"."student_subject_enrollments"
      ADD CONSTRAINT "student_subject_enrollments_studentId_fkey"
        FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    ALTER TABLE "public"."student_subject_enrollments"
      ADD CONSTRAINT "student_subject_enrollments_classId_fkey"
        FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    ALTER TABLE "public"."student_subject_enrollments"
      ADD CONSTRAINT "student_subject_enrollments_subjectId_fkey"
        FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

    ALTER TABLE "public"."student_subject_enrollments"
      ADD CONSTRAINT "student_subject_enrollments_teacherAssignmentId_fkey"
        FOREIGN KEY ("teacherAssignmentId") REFERENCES "public"."teacher_assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

    ALTER TABLE "public"."student_subject_enrollments"
      ADD CONSTRAINT "student_subject_enrollments_termId_fkey"
        FOREIGN KEY ("termId") REFERENCES "public"."academic_terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

    CREATE UNIQUE INDEX IF NOT EXISTS "student_subject_enrollments_studentId_subjectId_academicYear_key"
      ON "public"."student_subject_enrollments"("studentId", "subjectId", "academicYear");
  END IF;
END $$;

