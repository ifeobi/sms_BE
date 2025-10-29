-- CreateTable
CREATE TABLE "public"."product_ratings" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "marketplaceItemId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "review" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_ratings_studentId_marketplaceItemId_key" ON "public"."product_ratings"("studentId", "marketplaceItemId");

-- AddForeignKey
ALTER TABLE "public"."product_ratings" ADD CONSTRAINT "product_ratings_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_ratings" ADD CONSTRAINT "product_ratings_marketplaceItemId_fkey" FOREIGN KEY ("marketplaceItemId") REFERENCES "public"."marketplace_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
