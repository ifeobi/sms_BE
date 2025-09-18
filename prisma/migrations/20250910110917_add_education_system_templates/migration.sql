-- CreateTable
CREATE TABLE "public"."education_system_templates" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "systemName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_system_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."education_level_templates" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "education_level_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."education_subject_templates" (
    "id" TEXT NOT NULL,
    "levelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "education_subject_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."education_grading_scale_templates" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."GradingScaleType" NOT NULL,
    "scale" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "education_grading_scale_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."education_academic_term_templates" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "startMonth" INTEGER NOT NULL,
    "endMonth" INTEGER NOT NULL,
    "isExamTerm" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "education_academic_term_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "education_system_templates_countryCode_key" ON "public"."education_system_templates"("countryCode");

-- CreateIndex
CREATE UNIQUE INDEX "education_level_templates_templateId_levelId_key" ON "public"."education_level_templates"("templateId", "levelId");

-- CreateIndex
CREATE UNIQUE INDEX "education_subject_templates_levelId_name_key" ON "public"."education_subject_templates"("levelId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "education_grading_scale_templates_templateId_name_key" ON "public"."education_grading_scale_templates"("templateId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "education_academic_term_templates_templateId_name_key" ON "public"."education_academic_term_templates"("templateId", "name");

-- AddForeignKey
ALTER TABLE "public"."education_level_templates" ADD CONSTRAINT "education_level_templates_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."education_system_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."education_subject_templates" ADD CONSTRAINT "education_subject_templates_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."education_level_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."education_grading_scale_templates" ADD CONSTRAINT "education_grading_scale_templates_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."education_system_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."education_academic_term_templates" ADD CONSTRAINT "education_academic_term_templates_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."education_system_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
