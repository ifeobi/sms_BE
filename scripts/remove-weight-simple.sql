-- Remove weight fields from existing assessment structure JSON data

-- Remove weight from caComponents (keep only name and maxScore)
UPDATE assessment_structures
SET "caComponents" = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', COALESCE((elem.value)->>'name', 'CA' || elem.idx::text),
      'maxScore', CASE 
        WHEN (elem.value)->>'maxScore' ~ '^[0-9]+$' THEN ((elem.value)->>'maxScore')::int
        ELSE 10
      END
    )
    ORDER BY elem.idx
  )
  FROM jsonb_array_elements("caComponents") WITH ORDINALITY AS elem(value, idx)
)
WHERE "caComponents" IS NOT NULL 
  AND jsonb_typeof("caComponents") = 'array'
  AND EXISTS (
    SELECT 1 FROM jsonb_array_elements("caComponents") AS comp WHERE comp ? 'weight'
  );

-- Remove weight from examConfig (keep only maxScore and isRequired)
UPDATE assessment_structures
SET "examConfig" = jsonb_build_object(
  'maxScore', CASE 
    WHEN "examConfig"->>'maxScore' ~ '^[0-9]+$' THEN ("examConfig"->>'maxScore')::int
    ELSE 60
  END,
  'isRequired', COALESCE(
    CASE 
      WHEN "examConfig"->>'isRequired' = 'true' THEN true
      WHEN "examConfig"->>'isRequired' = 'false' THEN false
      ELSE true
    END, 
    true
  )
)
WHERE "examConfig" IS NOT NULL 
  AND jsonb_typeof("examConfig") = 'object'
  AND "examConfig" ? 'weight';
