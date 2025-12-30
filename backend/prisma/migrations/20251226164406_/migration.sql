-- CreateEnum
CREATE TYPE "VoidRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "YeuCauHuyMon" (
    "id" TEXT NOT NULL,
    "donHangId" TEXT NOT NULL,
    "chiTietDonHangId" TEXT NOT NULL,
    "lyDo" TEXT NOT NULL,
    "trangThai" "VoidRequestStatus" NOT NULL DEFAULT 'PENDING',
    "nguoiYeuCauId" TEXT,
    "nguoiDuyetId" TEXT,
    "ghiChuDuyet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YeuCauHuyMon_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "YeuCauHuyMon" ADD CONSTRAINT "YeuCauHuyMon_donHangId_fkey" FOREIGN KEY ("donHangId") REFERENCES "DonHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YeuCauHuyMon" ADD CONSTRAINT "YeuCauHuyMon_chiTietDonHangId_fkey" FOREIGN KEY ("chiTietDonHangId") REFERENCES "ChiTietDonHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YeuCauHuyMon" ADD CONSTRAINT "YeuCauHuyMon_nguoiYeuCauId_fkey" FOREIGN KEY ("nguoiYeuCauId") REFERENCES "NhanVien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YeuCauHuyMon" ADD CONSTRAINT "YeuCauHuyMon_nguoiDuyetId_fkey" FOREIGN KEY ("nguoiDuyetId") REFERENCES "NhanVien"("id") ON DELETE SET NULL ON UPDATE CASCADE;
