/*
  Warnings:

  - You are about to drop the column `levelData` on the `school_academic_structures` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."school_academic_structures" DROP COLUMN "levelData";

-- CreateTable
CREATE TABLE "public"."school_class_levels" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "educationLevelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "shortName" TEXT NOT NULL,
    "ageRangeMin" INTEGER NOT NULL,
    "ageRangeMax" INTEGER NOT NULL,
    "isGraduationLevel" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_class_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."school_subjects" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "applicableLevels" JSONB NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."school_grading_scales" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "passingGrade" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "ranges" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_grading_scales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."school_academic_terms" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "startMonth" INTEGER NOT NULL,
    "endMonth" INTEGER NOT NULL,
    "isExamTerm" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_academic_terms_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."school_class_levels" ADD CONSTRAINT "school_class_levels_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."school_subjects" ADD CONSTRAINT "school_subjects_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."school_grading_scales" ADD CONSTRAINT "school_grading_scales_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."school_academic_terms" ADD CONSTRAINT "school_academic_terms_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
