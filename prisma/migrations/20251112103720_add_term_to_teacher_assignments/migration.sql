-- AlterTable
ALTER TABLE "public"."teacher_assignments" ADD COLUMN     "termId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."teacher_assignments" ADD CONSTRAINT "teacher_assignments_termId_fkey" FOREIGN KEY ("termId") REFERENCES "public"."academic_terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
