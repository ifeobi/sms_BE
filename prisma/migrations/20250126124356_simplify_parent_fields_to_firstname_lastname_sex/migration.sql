-- AlterTable
ALTER TABLE "students" 
DROP COLUMN IF EXISTS "fatherName",
DROP COLUMN IF EXISTS "fatherOccupation",
DROP COLUMN IF EXISTS "fatherPhone",
DROP COLUMN IF EXISTS "fatherEmail",
DROP COLUMN IF EXISTS "motherName",
DROP COLUMN IF EXISTS "motherOccupation",
DROP COLUMN IF EXISTS "motherPhone",
DROP COLUMN IF EXISTS "motherEmail",
DROP COLUMN IF EXISTS "guardianName",
DROP COLUMN IF EXISTS "guardianRelationship",
DROP COLUMN IF EXISTS "guardianPhone",
DROP COLUMN IF EXISTS "guardianEmail";

-- Add new simplified parent fields
ALTER TABLE "students" 
ADD COLUMN IF NOT EXISTS "parentFirstName" TEXT,
ADD COLUMN IF NOT EXISTS "parentLastName" TEXT,
ADD COLUMN IF NOT EXISTS "parentPhone" TEXT,
ADD COLUMN IF NOT EXISTS "parentEmail" TEXT,
ADD COLUMN IF NOT EXISTS "parentSex" "Gender";

