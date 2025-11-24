-- Remove weight fields from existing assessment structure JSON data
-- Run this script to clean up existing data that still has weight fields
-- This is safe to run multiple times

-- Update caComponents to remove weight field from each component
-- Only keeps name and maxScore, removes weight
UPDATE "assessment_structures"
SET "caComponents" = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', COALESCE(component->>'name', 'CA' || (row_number() OVER ())::text),
      'maxScore', CASE 
        WHEN component->>'maxScore' ~ '^[0-9]+\.?[0-9]*$' THEN (component->>'maxScore')::numeric::int
        ELSE 10
      END
    )
  )
  FROM jsonb_array_elements("caComponents") WITH ORDINALITY AS component(value, idx)
)
WHERE "caComponents" IS NOT NULL 
  AND jsonb_typeof("caComponents") = 'array'
  AND EXISTS (
    SELECT 1 
    FROM jsonb_array_elements("caComponents") AS comp 
    WHERE comp ? 'weight'
  );

-- Update examConfig to remove weight field
-- Only keeps maxScore and isRequired, removes weight
UPDATE "assessment_structures"
SET "examConfig" = jsonb_build_object(
  'maxScore', CASE 
    WHEN "examConfig"->>'maxScore' ~ '^[0-9]+\.?[0-9]*$' THEN ("examConfig"->>'maxScore')::numeric::int
    ELSE 60
  END,
  'isRequired', COALESCE(
    CASE 
      WHEN "examConfig"->>'isRequired'::text = 'true' THEN true
      WHEN "examConfig"->>'isRequired'::text = 'false' THEN false
      WHEN ("examConfig"->>'isRequired')::boolean IS NOT NULL THEN ("examConfig"->>'isRequired')::boolean
      ELSE true
    END, 
    true
  )
)
WHERE "examConfig" IS NOT NULL 
  AND jsonb_typeof("examConfig") = 'object'
  AND "examConfig" ? 'weight';

-- Check the specific record mentioned
SELECT 
  id, 
  "levelId",
  "caComponents", 
  "examConfig",
  "calculationMethod"
FROM "assessment_structures" 
WHERE id = 'cmhul3kk1001nv3ecoc35gozl';
