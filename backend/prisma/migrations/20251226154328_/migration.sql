-- CreateTable
CREATE TABLE "YeuCauHuyMon" (
    "id" TEXT NOT NULL,
    "donHangId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "lyDo" TEXT NOT NULL,
    "nguoiYeuCauId" TEXT,
    "nguoiDuyetId" TEXT,
    "trangThai" TEXT NOT NULL DEFAULT 'CHO_DUYET',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YeuCauHuyMon_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "YeuCauHuyMon" ADD CONSTRAINT "YeuCauHuyMon_donHangId_fkey" FOREIGN KEY ("donHangId") REFERENCES "DonHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YeuCauHuyMon" ADD CONSTRAINT "YeuCauHuyMon_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "ChiTietDonHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YeuCauHuyMon" ADD CONSTRAINT "YeuCauHuyMon_nguoiYeuCauId_fkey" FOREIGN KEY ("nguoiYeuCauId") REFERENCES "NhanVien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YeuCauHuyMon" ADD CONSTRAINT "YeuCauHuyMon_nguoiDuyetId_fkey" FOREIGN KEY ("nguoiDuyetId") REFERENCES "NhanVien"("id") ON DELETE SET NULL ON UPDATE CASCADE;
