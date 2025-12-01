-- CreateTable: AssignmentGrade
CREATE TABLE "public"."assignment_grades" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "grade" TEXT,
    "percentage" DOUBLE PRECISION,
    "gpa" DOUBLE PRECISION,
    "feedback" TEXT,
    "comments" TEXT,
    "isLate" BOOLEAN NOT NULL DEFAULT false,
    "latePenaltyApplied" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "resubmissionCount" INTEGER NOT NULL DEFAULT 0,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "gradedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT NOT NULL,
    "lastModified" TIMESTAMP(3) NOT NULL,
    "modifiedBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "publishedBy" TEXT,

    CONSTRAINT "assignment_grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CAComponentGrade
CREATE TABLE "public"."ca_component_grades" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "componentType" TEXT NOT NULL,
    "componentName" TEXT,
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "grade" TEXT,
    "percentage" DOUBLE PRECISION,
    "gpa" DOUBLE PRECISION,
    "feedback" TEXT,
    "notes" TEXT,
    "gradedAt" TIMESTAMP(3),
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT NOT NULL,
    "lastModified" TIMESTAMP(3) NOT NULL,
    "modifiedBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "publishedBy" TEXT,

    CONSTRAINT "ca_component_grades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assignment_grades_assignmentId_studentId_attemptNumber_key" ON "public"."assignment_grades"("assignmentId", "studentId", "attemptNumber");

-- CreateIndex
CREATE INDEX "assignment_grades_assignmentId_idx" ON "public"."assignment_grades"("assignmentId");

-- CreateIndex
CREATE INDEX "assignment_grades_studentId_idx" ON "public"."assignment_grades"("studentId");

-- CreateIndex
CREATE INDEX "assignment_grades_subjectId_classId_termId_idx" ON "public"."assignment_grades"("subjectId", "classId", "termId");

-- CreateIndex
CREATE UNIQUE INDEX "ca_component_grades_studentId_subjectId_classId_termId_componentType_key" ON "public"."ca_component_grades"("studentId", "subjectId", "classId", "termId", "componentType");

-- CreateIndex
CREATE INDEX "ca_component_grades_studentId_idx" ON "public"."ca_component_grades"("studentId");

-- CreateIndex
CREATE INDEX "ca_component_grades_subjectId_classId_termId_idx" ON "public"."ca_component_grades"("subjectId", "classId", "termId");

-- CreateIndex
CREATE INDEX "ca_component_grades_componentType_idx" ON "public"."ca_component_grades"("componentType");

-- AddForeignKey
ALTER TABLE "public"."assignment_grades" ADD CONSTRAINT "assignment_grades_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignment_grades" ADD CONSTRAINT "assignment_grades_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignment_grades" ADD CONSTRAINT "assignment_grades_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignment_grades" ADD CONSTRAINT "assignment_grades_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignment_grades" ADD CONSTRAINT "assignment_grades_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignment_grades" ADD CONSTRAINT "assignment_grades_termId_fkey" FOREIGN KEY ("termId") REFERENCES "public"."academic_terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ca_component_grades" ADD CONSTRAINT "ca_component_grades_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ca_component_grades" ADD CONSTRAINT "ca_component_grades_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ca_component_grades" ADD CONSTRAINT "ca_component_grades_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ca_component_grades" ADD CONSTRAINT "ca_component_grades_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ca_component_grades" ADD CONSTRAINT "ca_component_grades_termId_fkey" FOREIGN KEY ("termId") REFERENCES "public"."academic_terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

