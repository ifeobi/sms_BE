-- Rename caScore to assignmentScore
ALTER TABLE "public"."academic_records" 
RENAME COLUMN "caScore" TO "assignmentScore";

-- Rename maxcaScore to assignmentMaxScore
ALTER TABLE "public"."academic_records" 
RENAME COLUMN "maxcaScore" TO "assignmentMaxScore";

-- Note: These fields are ONLY used for assignment records (assignmentId NOT NULL)
-- CA records use caComponentScore/caComponentMaxScore instead

