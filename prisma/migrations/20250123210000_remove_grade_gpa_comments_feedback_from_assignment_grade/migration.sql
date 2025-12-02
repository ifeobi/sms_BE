-- Remove grade, gpa, comments, and feedback from assignment_grades table
-- These fields will be handled by CAComponentGrade table

ALTER TABLE "public"."assignment_grades" 
DROP COLUMN IF EXISTS "grade",
DROP COLUMN IF EXISTS "gpa",
DROP COLUMN IF EXISTS "comments",
DROP COLUMN IF EXISTS "feedback";

