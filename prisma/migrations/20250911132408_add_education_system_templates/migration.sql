-- CreateTable
CREATE TABLE "public"."education_system_templates" (
    "id" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "systemName" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "templateData" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_system_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "education_system_templates_countryCode_key" ON "public"."education_system_templates"("countryCode");

-- AddForeignKey
ALTER TABLE "public"."school_academic_structures" ADD CONSTRAINT "school_academic_structures_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "public"."education_system_templates"("countryCode") ON DELETE RESTRICT ON UPDATE CASCADE;
