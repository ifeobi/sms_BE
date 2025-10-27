-- CreateEnum
CREATE TYPE "public"."EscrowStatus" AS ENUM ('PENDING', 'PAID', 'RELEASED', 'REFUNDED', 'DISPUTED');

-- CreateTable
CREATE TABLE "public"."escrow_transactions" (
    "id" TEXT NOT NULL,
    "marketplaceItemId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "paymentReference" TEXT,
    "paymentProvider" TEXT,
    "status" "public"."EscrowStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),

    CONSTRAINT "escrow_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seller_balances" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "pending" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "available" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_balances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "escrow_transactions_paymentReference_key" ON "public"."escrow_transactions"("paymentReference");

-- CreateIndex
CREATE UNIQUE INDEX "seller_balances_sellerId_key" ON "public"."seller_balances"("sellerId");

-- AddForeignKey
ALTER TABLE "public"."escrow_transactions" ADD CONSTRAINT "escrow_transactions_marketplaceItemId_fkey" FOREIGN KEY ("marketplaceItemId") REFERENCES "public"."marketplace_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."escrow_transactions" ADD CONSTRAINT "escrow_transactions_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."escrow_transactions" ADD CONSTRAINT "escrow_transactions_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."seller_balances" ADD CONSTRAINT "seller_balances_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
