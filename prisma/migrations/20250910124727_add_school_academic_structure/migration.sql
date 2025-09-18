/*
  Warnings:

  - You are about to drop the `education_academic_term_templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `education_grading_scale_templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `education_level_templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `education_subject_templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `education_system_templates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."education_academic_term_templates" DROP CONSTRAINT "education_academic_term_templates_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."education_grading_scale_templates" DROP CONSTRAINT "education_grading_scale_templates_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."education_level_templates" DROP CONSTRAINT "education_level_templates_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."education_subject_templates" DROP CONSTRAINT "education_subject_templates_levelId_fkey";

-- DropTable
DROP TABLE "public"."education_academic_term_templates";

-- DropTable
DROP TABLE "public"."education_grading_scale_templates";

-- DropTable
DROP TABLE "public"."education_level_templates";

-- DropTable
DROP TABLE "public"."education_subject_templates";

-- DropTable
DROP TABLE "public"."education_system_templates";

-- CreateTable
CREATE TABLE "public"."school_academic_structures" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "systemName" TEXT NOT NULL,
    "selectedLevels" JSONB NOT NULL,
    "commonSubjects" JSONB,
    "commonGradingScales" JSONB,
    "commonAcademicTerms" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_academic_structures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "school_academic_structures_schoolId_key" ON "public"."school_academic_structures"("schoolId");

-- AddForeignKey
ALTER TABLE "public"."school_academic_structures" ADD CONSTRAINT "school_academic_structures_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
