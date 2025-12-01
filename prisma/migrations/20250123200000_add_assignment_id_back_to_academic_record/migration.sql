-- Add assignmentId column back to academic_records table
-- Note: This is being added back per user request, even though assignment data
-- is now primarily stored in assignment_grades table

ALTER TABLE "public"."academic_records" 
ADD COLUMN IF NOT EXISTS "assignmentId" TEXT;

-- Add foreign key constraint
ALTER TABLE "public"."academic_records"
ADD CONSTRAINT "academic_records_assignmentId_fkey" 
FOREIGN KEY ("assignmentId") 
REFERENCES "public"."assignments"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS "academic_records_assignmentId_idx" 
ON "public"."academic_records"("assignmentId");

