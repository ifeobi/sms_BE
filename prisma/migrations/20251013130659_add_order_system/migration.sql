-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'IN_DELIVERY', 'DELIVERED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'DISPUTED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'ESCROWED', 'RELEASED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."DisputeStatus" AS ENUM ('NONE', 'OPEN', 'UNDER_REVIEW', 'RESOLVED');

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "orderCode" TEXT NOT NULL,
    "deliveryCode" TEXT NOT NULL,
    "itemPrice" DOUBLE PRECISION NOT NULL,
    "deliveryFee" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "availableDeliveryMethods" TEXT[],
    "creatorContact" TEXT NOT NULL,
    "creatorAvailability" TEXT,
    "generalPickupLocation" TEXT,
    "bookCondition" TEXT,
    "selectedDeliveryMethod" TEXT NOT NULL,
    "specificLocation" TEXT,
    "studentContact" TEXT NOT NULL,
    "studentEmail" TEXT,
    "preferredTime" TEXT,
    "specialInstructions" TEXT,
    "hostelName" TEXT,
    "roomNumber" TEXT,
    "landmark" TEXT,
    "status" "public"."OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "escrowHeld" BOOLEAN NOT NULL DEFAULT false,
    "escrowReleasedAt" TIMESTAMP(3),
    "orderCodeVerifiedAt" TIMESTAMP(3),
    "deliveryCodeEnteredAt" TIMESTAMP(3),
    "studentConfirmedAt" TIMESTAMP(3),
    "deliveryPhoto" TEXT,
    "gpsLocation" TEXT,
    "deliveryTimestamp" TIMESTAMP(3),
    "disputeStatus" "public"."DisputeStatus" NOT NULL DEFAULT 'NONE',
    "disputeReason" TEXT,
    "disputeEvidence" JSONB,
    "disputeResolvedAt" TIMESTAMP(3),
    "disputeResolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderCode_key" ON "public"."orders"("orderCode");

-- CreateIndex
CREATE UNIQUE INDEX "orders_deliveryCode_key" ON "public"."orders"("deliveryCode");

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."creators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "public"."content"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
