-- CreateTable
CREATE TABLE "KhuyenMai" (
    "id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "loai" TEXT NOT NULL,
    "giaTri" DECIMAL(12,2) NOT NULL,
    "dieuKien" TEXT,
    "ngayBatDau" TIMESTAMP(3),
    "ngayKetThuc" TIMESTAMP(3),
    "trangThai" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KhuyenMai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HangThanhVien" (
    "id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "mucTichDiem" INTEGER NOT NULL DEFAULT 10000,
    "tyLeQuyDoi" INTEGER NOT NULL DEFAULT 1000,
    "diemToiThieu" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HangThanhVien_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HangThanhVien_ten_key" ON "HangThanhVien"("ten");
