-- ⚠️ WARNING: Backup your database before running this script!
-- This script removes duplicate grading scales, keeping only the most recent one per level
-- Run the check script first to see what will be deleted

BEGIN;

-- Step 1: Show what will be deleted (for verification)
SELECT 
  gs.id,
  gs."schoolId",
  gs.name,
  gs."isActive",
  gs."isDefault",
  'WILL BE DELETED' as action
FROM grading_scales gs
WHERE gs.id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      "schoolId",
      SUBSTRING(name, 1, CASE 
        WHEN POSITION(' -' IN name) > 0 
        THEN POSITION(' -' IN name) - 1 
        ELSE LENGTH(name) 
      END) as level_name,
      ROW_NUMBER() OVER (
        PARTITION BY "schoolId", 
        SUBSTRING(name, 1, CASE 
          WHEN POSITION(' -' IN name) > 0 
          THEN POSITION(' -' IN name) - 1 
          ELSE LENGTH(name) 
        END)
        ORDER BY id DESC
      ) as rn
    FROM grading_scales
    WHERE name LIKE '% - %'
  ) t
  WHERE rn > 1
)
ORDER BY gs."schoolId", gs.name;

-- Step 2: Uncomment the line below to actually delete the duplicates
-- DELETE FROM grading_scales
-- WHERE id IN (
--   SELECT id
--   FROM (
--     SELECT 
--       id,
--       "schoolId",
--       SUBSTRING(name, 1, CASE 
--         WHEN POSITION(' -' IN name) > 0 
--         THEN POSITION(' -' IN name) - 1 
--         ELSE LENGTH(name) 
--       END) as level_name,
--       ROW_NUMBER() OVER (
--         PARTITION BY "schoolId", 
--         SUBSTRING(name, 1, CASE 
--           WHEN POSITION(' -' IN name) > 0 
--           THEN POSITION(' -' IN name) - 1 
--           ELSE LENGTH(name) 
--         END)
--         ORDER BY id DESC
--       ) as rn
--     FROM grading_scales
--     WHERE name LIKE '% - %'
--   ) t
--   WHERE rn > 1
-- );

-- Step 3: Uncomment to commit the transaction
-- COMMIT;

-- To rollback instead: ROLLBACK;

