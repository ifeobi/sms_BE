-- CreateTable
CREATE TABLE "public"."assignment_assignees" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assignment_assignees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assignment_assignees_assignmentId_studentId_key" ON "public"."assignment_assignees"("assignmentId", "studentId");

-- AddForeignKey
ALTER TABLE "public"."assignment_assignees" ADD CONSTRAINT "assignment_assignees_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assignment_assignees" ADD CONSTRAINT "assignment_assignees_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
