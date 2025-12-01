DO $$
BEGIN
  -- Ensure the content table exists before attempting to modify the column
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'content'
  ) THEN
    -- Check if the enum type already exists
    IF EXISTS (
      SELECT 1
      FROM pg_type t
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
        AND t.typname = 'contenttype'
    ) THEN
      -- Clean up any leftover temporary type from previous runs
      IF EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
          AND t.typname = 'contenttype_new'
      ) THEN
        EXECUTE 'DROP TYPE "public"."ContentType_new"';
      END IF;

      EXECUTE 'ALTER TABLE "public"."content" ALTER COLUMN "contentType" DROP DEFAULT';
      EXECUTE 'CREATE TYPE "public"."ContentType_new" AS ENUM (''DIGITAL'', ''PHYSICAL'')';
      EXECUTE '
        ALTER TABLE "public"."content"
        ALTER COLUMN "contentType" TYPE "public"."ContentType_new"
        USING CASE
          WHEN "contentType"::text IN (''DIGITAL'', ''PHYSICAL'')
            THEN "contentType"::text::"public"."ContentType_new"
          ELSE ''DIGITAL''::"public"."ContentType_new"
        END
      ';
      EXECUTE 'ALTER TYPE "public"."ContentType" RENAME TO "ContentType_old"';
      EXECUTE 'ALTER TYPE "public"."ContentType_new" RENAME TO "ContentType"';
      EXECUTE 'DROP TYPE "public"."ContentType_old"';
      EXECUTE 'ALTER TABLE "public"."content" ALTER COLUMN "contentType" SET DEFAULT ''DIGITAL''::"public"."ContentType"';
    ELSE
      EXECUTE 'ALTER TABLE "public"."content" ALTER COLUMN "contentType" DROP DEFAULT';
      -- No previous enum, so create the enum and cast from text values
      EXECUTE 'CREATE TYPE "public"."ContentType" AS ENUM (''DIGITAL'', ''PHYSICAL'')';
      EXECUTE '
        ALTER TABLE "public"."content"
        ALTER COLUMN "contentType" TYPE "public"."ContentType"
        USING CASE
          WHEN "contentType"::text IN (''DIGITAL'', ''PHYSICAL'')
            THEN "contentType"::text::"public"."ContentType"
          ELSE ''DIGITAL''::"public"."ContentType"
        END
      ';
      EXECUTE 'ALTER TABLE "public"."content" ALTER COLUMN "contentType" SET DEFAULT ''DIGITAL''::"public"."ContentType"';
    END IF;
  END IF;
END $$;
