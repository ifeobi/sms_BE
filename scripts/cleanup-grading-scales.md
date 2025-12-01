# Grading Scales Cleanup Guide

## Current Situation
You have existing grading scale records in your database. With the updated code, the system will now:
- **Update existing records** instead of creating duplicates
- Match grading scales to levels by name pattern (e.g., "Nursery School - Nigerian Grading Scale")

## Options for Existing Data

### Option 1: Keep All Existing Data (Recommended)
**No action needed!** The new code will work with your existing data:
- It will find and update existing grading scales based on the name pattern
- If you have duplicates for the same level, it will update the first one it finds
- Future saves will update instead of create

### Option 2: Clean Up Duplicates
If you have multiple grading scales for the same level and want to keep only one:

#### Using Prisma Studio (Visual):
1. Open Prisma Studio: `npx prisma studio`
2. Navigate to `GradingScale` table
3. Look for records with similar names (e.g., multiple "Nursery School - ..." entries)
4. Manually delete the duplicates, keeping the most recent or correct one

#### Using SQL Query (Identify Duplicates):
Run this query to find duplicate grading scales by level name pattern:

```sql
-- Find grading scales with duplicate level names
SELECT 
  schoolId,
  SUBSTRING(name, 1, POSITION(' -' IN name) - 1) as level_name,
  COUNT(*) as count,
  STRING_AGG(id::text, ', ') as scale_ids
FROM grading_scales
WHERE name LIKE '% - %'
GROUP BY schoolId, SUBSTRING(name, 1, POSITION(' -' IN name) - 1)
HAVING COUNT(*) > 1;
```

#### Using SQL Query (Delete Oldest Duplicates):
⚠️ **Backup your database first!**

```sql
-- Delete duplicate grading scales, keeping the most recent one
DELETE FROM grading_scales
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY schoolId, 
             SUBSTRING(name, 1, POSITION(' -' IN name) - 1)
             ORDER BY id DESC
           ) as rn
    FROM grading_scales
    WHERE name LIKE '% - %'
  ) t
  WHERE rn > 1
);
```

### Option 3: Set Inactive Instead of Delete
If you want to keep historical data but hide duplicates:

```sql
-- Set older duplicates as inactive
UPDATE grading_scales
SET "isActive" = false
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY schoolId, 
             SUBSTRING(name, 1, POSITION(' -' IN name) - 1)
             ORDER BY id DESC
           ) as rn
    FROM grading_scales
    WHERE name LIKE '% - %' AND "isActive" = true
  ) t
  WHERE rn > 1
);
```

## Recommended Approach

1. **First, test the new code** - Try saving changes and see if it updates correctly
2. **Check for issues** - If you see unexpected behavior, check for duplicates
3. **Clean up if needed** - Use Option 2 or 3 only if you have problematic duplicates
4. **Monitor** - Future saves should now update instead of create

## Verification

After cleanup, verify by:
1. Go to Academic Structure → Grading System tab
2. Check that each level shows the correct grading scale
3. Make a small change and click "Save All Changes"
4. Check Prisma Studio - should see updates, not new records

