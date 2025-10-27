/*
  Warnings:

  - You are about to drop the column `type` on the `schools` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."schools" DROP COLUMN "type";

-- CreateTable
CREATE TABLE "public"."school_academic_configs" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "educationSystemId" TEXT NOT NULL,
    "selectedLevels" TEXT[],
    "availableLevels" TEXT[],
    "customClassNames" JSONB,
    "customSubjectNames" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_academic_configs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."school_academic_configs" ADD CONSTRAINT "school_academic_configs_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
