-- CreateTable
CREATE TABLE "public"."assessment_structures" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "caComponents" JSONB NOT NULL,
    "examConfig" JSONB,
    "calculationMethod" TEXT NOT NULL DEFAULT 'sum',
    "totalMaxScore" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_structures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assessment_structures_levelId_schoolId_key" ON "public"."assessment_structures"("levelId", "schoolId");

-- AddForeignKey
ALTER TABLE "public"."assessment_structures" ADD CONSTRAINT "assessment_structures_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assessment_structures" ADD CONSTRAINT "assessment_structures_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
