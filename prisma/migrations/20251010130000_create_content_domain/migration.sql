-- Create enums required for content domain
CREATE TYPE "public"."LicenseType" AS ENUM ('PERSONAL', 'COMMERCIAL', 'LIFETIME');
CREATE TYPE "public"."Visibility" AS ENUM ('PUBLIC', 'APPROVAL_REQUIRED');
CREATE TYPE "public"."ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "public"."FileType" AS ENUM (
  'DIGITAL_FILE',
  'PHYSICAL_IMAGE',
  'VIDEO_FILE',
  'THUMBNAIL',
  'PREVIEW_IMAGE',
  'AUDIO_FILE',
  'INTERACTIVE_FILE',
  'NOTES_FILE',
  'WORKSHEET_FILE',
  'ASSIGNMENT_FILE',
  'PAST_QUESTIONS_FILE'
);

-- Support tables for categorisation
CREATE TABLE "public"."content_categories" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "content_categories_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "content_categories_name_key" UNIQUE ("name")
);

CREATE TABLE "public"."subject_categories" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "subject_categories_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "subject_categories_name_key" UNIQUE ("name")
);

-- Main content table
CREATE TABLE "public"."content" (
  "id" TEXT NOT NULL,
  "creatorId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "contentCategoryId" TEXT,
  "subjectCategoryId" TEXT,
  "contentType" TEXT NOT NULL DEFAULT 'DIGITAL',
  "contactInfo" TEXT,
  "digitalDeliveryMethod" TEXT,
  "accessInstructions" TEXT,
  "fileSizeFormat" TEXT,
  "supportContact" TEXT,
  "videoDuration" TEXT,
  "videoDeliveryMethod" TEXT,
  "worksheetGrade" TEXT,
  "worksheetFormat" TEXT,
  "assignmentGrade" TEXT,
  "assignmentFormat" TEXT,
  "assignmentLength" TEXT,
  "examBody" TEXT,
  "examYears" TEXT,
  "examLevel" TEXT,
  "pastQuestionsFormat" TEXT,
  "pastQuestionsPages" TEXT,
  "audiobookAuthor" TEXT,
  "audiobookNarrator" TEXT,
  "audiobookDuration" TEXT,
  "audiobookLanguage" TEXT,
  "audiobookFormat" TEXT,
  "interactiveFormat" TEXT,
  "interactiveLevel" TEXT,
  "interactiveDuration" TEXT,
  "interactiveLink" TEXT,
  "notesLevel" TEXT,
  "notesFormat" TEXT,
  "notesLength" TEXT,
  "digitalPrice" DOUBLE PRECISION,
  "videoPrice" DOUBLE PRECISION,
  "worksheetPrice" DOUBLE PRECISION,
  "assignmentPrice" DOUBLE PRECISION,
  "pastQuestionsPrice" DOUBLE PRECISION,
  "audiobookPrice" DOUBLE PRECISION,
  "interactivePrice" DOUBLE PRECISION,
  "notesPrice" DOUBLE PRECISION,
  "currency" TEXT NOT NULL DEFAULT 'NGN',
  "licenseType" "public"."LicenseType" NOT NULL DEFAULT 'PERSONAL',
  "visibility" "public"."Visibility" NOT NULL DEFAULT 'PUBLIC',
  "tags" JSONB,
  "status" "public"."ContentStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "downloadCount" INTEGER NOT NULL DEFAULT 0,
  "salesCount" INTEGER NOT NULL DEFAULT 0,
  "ratingAverage" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reviewCount" INTEGER NOT NULL DEFAULT 0,
  "deliveryAvailability" TEXT,
  "deliveryFee" DOUBLE PRECISION,
  "deliveryNotes" TEXT,
  "physicalDeliveryMethod" TEXT,
  "pickupLocation" TEXT,
  "textbookAuthor" TEXT,
  "textbookEdition" TEXT,
  "textbookIsbn" TEXT,
  "textbookPrice" DOUBLE PRECISION,
  "textbookPublisher" TEXT,
  "textbookYear" INTEGER,
  "ebookAccessType" TEXT,
  "ebookAuthor" TEXT,
  "ebookFileFormat" TEXT,
  "ebookLanguage" TEXT,
  "ebookLicenseType" TEXT,
  "ebookPages" TEXT,
  "ebookPrice" DOUBLE PRECISION,

  CONSTRAINT "content_pkey" PRIMARY KEY ("id")
);

-- Content files table
CREATE TABLE "public"."content_files" (
  "id" TEXT NOT NULL,
  "contentId" TEXT NOT NULL,
  "fileType" "public"."FileType" NOT NULL,
  "originalName" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "mimeType" TEXT,
  "sizeBytes" BIGINT,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "content_files_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "public"."content"
  ADD CONSTRAINT "content_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."creators"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "content_contentCategoryId_fkey" FOREIGN KEY ("contentCategoryId") REFERENCES "public"."content_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "content_subjectCategoryId_fkey" FOREIGN KEY ("subjectCategoryId") REFERENCES "public"."subject_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."content_files"
  ADD CONSTRAINT "content_files_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

