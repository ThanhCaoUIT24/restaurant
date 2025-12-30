-- CreateTable
CREATE TABLE "ZReport" (
    "id" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" JSONB NOT NULL,
    "expectedCash" DECIMAL(12,2) NOT NULL,
    "actualCash" DECIMAL(12,2),
    "variance" DECIMAL(12,2),

    CONSTRAINT "ZReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ZReport_shiftId_key" ON "ZReport"("shiftId");

-- AddForeignKey
ALTER TABLE "ZReport" ADD CONSTRAINT "ZReport_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "CaThuNgan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
