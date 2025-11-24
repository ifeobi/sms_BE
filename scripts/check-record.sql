-- Check the specific Senior Secondary record
SELECT 
  id, 
  "levelId",
  jsonb_pretty("caComponents") as ca_components,
  jsonb_pretty("examConfig") as exam_config
FROM assessment_structures 
WHERE id = 'cmhul3kk1001nv3ecoc35gozl';

