/*
  Warnings:

  - You are about to drop the `school_academic_terms` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `school_class_levels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `school_grading_scales` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `school_subjects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."school_academic_terms" DROP CONSTRAINT "school_academic_terms_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "public"."school_class_levels" DROP CONSTRAINT "school_class_levels_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "public"."school_grading_scales" DROP CONSTRAINT "school_grading_scales_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "public"."school_subjects" DROP CONSTRAINT "school_subjects_schoolId_fkey";

-- AlterTable
ALTER TABLE "public"."school_academic_structures" ADD COLUMN     "customAcademicTerms" JSONB,
ADD COLUMN     "customAssessmentMethods" JSONB,
ADD COLUMN     "customClassLevels" JSONB,
ADD COLUMN     "customCurriculumStructure" JSONB,
ADD COLUMN     "customGradingScales" JSONB,
ADD COLUMN     "customSubjects" JSONB;

-- DropTable
DROP TABLE "public"."school_academic_terms";

-- DropTable
DROP TABLE "public"."school_class_levels";

-- DropTable
DROP TABLE "public"."school_grading_scales";

-- DropTable
DROP TABLE "public"."school_subjects";
