-- Script to identify duplicate grading scales in the database
-- Run this to see if you have duplicates that need cleanup

-- Find grading scales grouped by school and level name pattern
SELECT 
  gs.schoolId,
  s.name as school_name,
  SUBSTRING(gs.name, 1, CASE 
    WHEN POSITION(' -' IN gs.name) > 0 
    THEN POSITION(' -' IN gs.name) - 1 
    ELSE LENGTH(gs.name) 
  END) as level_name,
  COUNT(*) as duplicate_count,
  STRING_AGG(gs.id::text, ', ' ORDER BY gs.id) as scale_ids,
  STRING_AGG(gs.name, ' | ' ORDER BY gs.id) as scale_names,
  STRING_AGG(gs."isActive"::text, ', ' ORDER BY gs.id) as is_active_flags
FROM grading_scales gs
LEFT JOIN schools s ON s.id = gs.schoolId
WHERE gs.name LIKE '% - %'
GROUP BY gs.schoolId, s.name, SUBSTRING(gs.name, 1, CASE 
  WHEN POSITION(' -' IN gs.name) > 0 
  THEN POSITION(' -' IN gs.name) - 1 
  ELSE LENGTH(gs.name) 
END)
HAVING COUNT(*) > 1
ORDER BY gs.schoolId, level_name;

-- Summary: Count total duplicates
SELECT 
  COUNT(*) as total_duplicate_groups,
  SUM(duplicate_count - 1) as total_duplicate_records_to_remove
FROM (
  SELECT 
    gs.schoolId,
    SUBSTRING(gs.name, 1, CASE 
      WHEN POSITION(' -' IN gs.name) > 0 
      THEN POSITION(' -' IN gs.name) - 1 
      ELSE LENGTH(gs.name) 
    END) as level_name,
    COUNT(*) as duplicate_count
  FROM grading_scales gs
  WHERE gs.name LIKE '% - %'
  GROUP BY gs.schoolId, SUBSTRING(gs.name, 1, CASE 
    WHEN POSITION(' -' IN gs.name) > 0 
    THEN POSITION(' -' IN gs.name) - 1 
    ELSE LENGTH(gs.name) 
  END)
  HAVING COUNT(*) > 1
) duplicates;

