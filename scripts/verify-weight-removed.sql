-- Verify weight has been removed from assessment structures
SELECT 
  id, 
  "levelId",
  "caComponents", 
  "examConfig"
FROM assessment_structures 
WHERE id = 'cmhul3kk1001nv3ecoc35gozl';

-- Check if any records still have weight
SELECT 
  id,
  "levelId",
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM jsonb_array_elements("caComponents") AS comp WHERE comp ? 'weight'
    ) THEN 'Has weight in caComponents'
    ELSE 'No weight in caComponents'
  END as ca_status,
  CASE 
    WHEN "examConfig" ? 'weight' THEN 'Has weight in examConfig'
    ELSE 'No weight in examConfig'
  END as exam_status
FROM assessment_structures
WHERE "caComponents" IS NOT NULL OR "examConfig" IS NOT NULL;

