-- CreateTable
CREATE TABLE "VoidRequest" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderItemId" TEXT,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedBy" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approverNote" TEXT,

    CONSTRAINT "VoidRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VoidRequest" ADD CONSTRAINT "VoidRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "DonHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoidRequest" ADD CONSTRAINT "VoidRequest_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "ChiTietDonHang"("id") ON DELETE SET NULL ON UPDATE CASCADE;
