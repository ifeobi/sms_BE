/*
  Warnings:

  - You are about to drop the column `deliveryAvailability` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryFee` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryMethods` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryNotes` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `physicalCondition` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `physicalDeliveryMethod` on the `content` table. All the data in the column will be lost.
  - You are about to drop the column `pickupLocation` on the `content` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."content" DROP COLUMN "deliveryAvailability",
DROP COLUMN "deliveryFee",
DROP COLUMN "deliveryMethods",
DROP COLUMN "deliveryNotes",
DROP COLUMN "physicalCondition",
DROP COLUMN "physicalDeliveryMethod",
DROP COLUMN "pickupLocation";
