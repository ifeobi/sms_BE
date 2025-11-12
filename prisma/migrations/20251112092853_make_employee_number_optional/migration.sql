-- DropIndex
DROP INDEX "public"."teachers_employeeNumber_key";

-- AlterTable
ALTER TABLE "public"."content" ALTER COLUMN "contentType" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."content_categories" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."creators" ALTER COLUMN "categories" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."schools" ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."subject_categories" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."teachers" ALTER COLUMN "employeeNumber" DROP NOT NULL;

-- RenameIndex
ALTER INDEX "public"."student_subject_enrollments_studentId_subjectId_academicYear_ke" RENAME TO "student_subject_enrollments_studentId_subjectId_academicYea_key";
