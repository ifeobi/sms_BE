-- AlterTable
ALTER TABLE "public"."content" ADD COLUMN     "ebookAccessType" TEXT,
ADD COLUMN     "ebookAuthor" TEXT,
ADD COLUMN     "ebookFileFormat" TEXT,
ADD COLUMN     "ebookLanguage" TEXT,
ADD COLUMN     "ebookLicenseType" TEXT,
ADD COLUMN     "ebookPages" TEXT,
ADD COLUMN     "ebookPrice" DOUBLE PRECISION;
