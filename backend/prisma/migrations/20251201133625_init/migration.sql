-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('TRONG', 'DADAT', 'COKHACH', 'CHOTHANHTOAN', 'CANDON');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('CHOCHEBIEN', 'DANGLAM', 'HOANTHANH', 'DAPHUCVU', 'DAHUY');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TienMat', 'The', 'QR', 'Diem');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('CHODEN', 'DANHANBAN', 'HUY', 'KHONGDEN');

-- CreateEnum
CREATE TYPE "POStatus" AS ENUM ('MOITAO', 'DAGUI', 'DANHANDU', 'DANHANMOTPHAN', 'DAHUY');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('HOATDONG', 'DADONG');

-- CreateTable
CREATE TABLE "NhanVien" (
    "id" TEXT NOT NULL,
    "hoTen" TEXT NOT NULL,
    "soDienThoai" TEXT,
    "vaiTroId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NhanVien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaiTro" (
    "id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "moTa" TEXT,

    CONSTRAINT "VaiTro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quyen" (
    "id" TEXT NOT NULL,
    "ma" TEXT NOT NULL,
    "moTa" TEXT,

    CONSTRAINT "Quyen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaiTroQuyen" (
    "id" TEXT NOT NULL,
    "vaiTroId" TEXT NOT NULL,
    "quyenId" TEXT NOT NULL,

    CONSTRAINT "VaiTroQuyen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaiKhoanNguoiDung" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nhanVienId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaiKhoanNguoiDung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DanhMucMon" (
    "id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "moTa" TEXT,

    CONSTRAINT "DanhMucMon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonAn" (
    "id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "moTa" TEXT,
    "giaBan" DECIMAL(12,2) NOT NULL,
    "trangThai" BOOLEAN NOT NULL DEFAULT true,
    "tramCheBien" TEXT,
    "danhMucId" TEXT,

    CONSTRAINT "MonAn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NguyenVatLieu" (
    "id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "donViTinh" TEXT NOT NULL,
    "soLuongTon" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "mucTonToiThieu" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "giaNhapGanNhat" DECIMAL(12,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NguyenVatLieu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CongThucMon" (
    "id" TEXT NOT NULL,
    "monAnId" TEXT NOT NULL,
    "nguyenVatLieuId" TEXT NOT NULL,
    "soLuong" DECIMAL(12,3) NOT NULL,

    CONSTRAINT "CongThucMon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KhuVucBan" (
    "id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,

    CONSTRAINT "KhuVucBan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ban" (
    "id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "trangThai" "TableStatus" NOT NULL DEFAULT 'TRONG',
    "posX" DOUBLE PRECISION,
    "posY" DOUBLE PRECISION,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "shape" TEXT,
    "khuVucId" TEXT,

    CONSTRAINT "Ban_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonHang" (
    "id" TEXT NOT NULL,
    "banId" TEXT NOT NULL,
    "nhanVienId" TEXT,
    "trangThai" TEXT,
    "ghiChu" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonHang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChiTietDonHang" (
    "id" TEXT NOT NULL,
    "donHangId" TEXT NOT NULL,
    "monAnId" TEXT NOT NULL,
    "soLuong" INTEGER NOT NULL,
    "donGia" DECIMAL(12,2) NOT NULL,
    "trangThai" "OrderItemStatus" NOT NULL DEFAULT 'CHOCHEBIEN',
    "ghiChu" TEXT,

    CONSTRAINT "ChiTietDonHang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TuyChonMon" (
    "id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "giaThem" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "TuyChonMon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChiTietTuyChonMon" (
    "id" TEXT NOT NULL,
    "chiTietDonHangId" TEXT NOT NULL,
    "tuyChonMonId" TEXT NOT NULL,
    "monAnId" TEXT,

    CONSTRAINT "ChiTietTuyChonMon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HoaDon" (
    "id" TEXT NOT NULL,
    "donHangId" TEXT NOT NULL,
    "tongTienHang" DECIMAL(12,2) NOT NULL,
    "giamGia" DECIMAL(12,2),
    "thueVAT" DECIMAL(12,2),
    "tongThanhToan" DECIMAL(12,2) NOT NULL,
    "trangThai" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HoaDon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThanhToan" (
    "id" TEXT NOT NULL,
    "hoaDonId" TEXT NOT NULL,
    "phuongThuc" "PaymentMethod" NOT NULL,
    "soTien" DECIMAL(12,2) NOT NULL,
    "ghiChu" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThanhToan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaThuNgan" (
    "id" TEXT NOT NULL,
    "nhanVienId" TEXT NOT NULL,
    "thoiGianMo" TIMESTAMP(3) NOT NULL,
    "thoiGianDong" TIMESTAMP(3),
    "tienMatDauCa" DECIMAL(12,2) NOT NULL,
    "tienMatThuc" DECIMAL(12,2),
    "trangThai" "ShiftStatus" NOT NULL DEFAULT 'HOATDONG',

    CONSTRAINT "CaThuNgan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KhachHang" (
    "id" TEXT NOT NULL,
    "hoTen" TEXT NOT NULL,
    "soDienThoai" TEXT NOT NULL,
    "hangThe" TEXT,
    "diemTichLuy" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "KhachHang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatBan" (
    "id" TEXT NOT NULL,
    "khachHangId" TEXT NOT NULL,
    "banId" TEXT,
    "soKhach" INTEGER NOT NULL,
    "thoiGianDen" TIMESTAMP(3) NOT NULL,
    "ghiChu" TEXT,
    "trangThai" "ReservationStatus" NOT NULL DEFAULT 'CHODEN',

    CONSTRAINT "DatBan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LichSuTichDiem" (
    "id" TEXT NOT NULL,
    "khachHangId" TEXT NOT NULL,
    "diemCong" INTEGER NOT NULL DEFAULT 0,
    "diemTru" INTEGER NOT NULL DEFAULT 0,
    "moTa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LichSuTichDiem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NhaCungCap" (
    "id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "dienThoai" TEXT,
    "diaChi" TEXT,

    CONSTRAINT "NhaCungCap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonMuaHang" (
    "id" TEXT NOT NULL,
    "nhaCungCapId" TEXT NOT NULL,
    "trangThai" "POStatus" NOT NULL DEFAULT 'MOITAO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DonMuaHang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChiTietDonMuaHang" (
    "id" TEXT NOT NULL,
    "donMuaHangId" TEXT NOT NULL,
    "nguyenVatLieuId" TEXT NOT NULL,
    "soLuong" DECIMAL(12,3) NOT NULL,
    "donGia" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "ChiTietDonMuaHang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhieuNhapKho" (
    "id" TEXT NOT NULL,
    "donMuaHangId" TEXT,
    "nhanVienId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhieuNhapKho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChiTietNhapKho" (
    "id" TEXT NOT NULL,
    "phieuNhapKhoId" TEXT NOT NULL,
    "nguyenVatLieuId" TEXT NOT NULL,
    "soLuong" DECIMAL(12,3) NOT NULL,
    "donGia" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "ChiTietNhapKho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NhatKyXuatKho" (
    "id" TEXT NOT NULL,
    "loai" TEXT NOT NULL,
    "nguyenVatLieuId" TEXT NOT NULL,
    "soLuong" DECIMAL(12,3) NOT NULL,
    "ghiChu" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NhatKyXuatKho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaLamViec" (
    "id" TEXT NOT NULL,
    "ten" TEXT NOT NULL,
    "batDau" TEXT NOT NULL,
    "ketThuc" TEXT NOT NULL,

    CONSTRAINT "CaLamViec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LichPhanCa" (
    "id" TEXT NOT NULL,
    "nhanVienId" TEXT NOT NULL,
    "caLamViecId" TEXT NOT NULL,
    "ngay" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LichPhanCa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChamCong" (
    "id" TEXT NOT NULL,
    "lichPhanCaId" TEXT NOT NULL,
    "thoiGianVao" TIMESTAMP(3),
    "thoiGianRa" TIMESTAMP(3),
    "trangThai" TEXT,

    CONSTRAINT "ChamCong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CauHinhHeThong" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CauHinhHeThong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NhatKyHeThong" (
    "id" TEXT NOT NULL,
    "hanhDong" TEXT NOT NULL,
    "thongTinBoSung" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NhatKyHeThong_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NhanVien_soDienThoai_key" ON "NhanVien"("soDienThoai");

-- CreateIndex
CREATE UNIQUE INDEX "Quyen_ma_key" ON "Quyen"("ma");

-- CreateIndex
CREATE UNIQUE INDEX "VaiTroQuyen_vaiTroId_quyenId_key" ON "VaiTroQuyen"("vaiTroId", "quyenId");

-- CreateIndex
CREATE UNIQUE INDEX "TaiKhoanNguoiDung_username_key" ON "TaiKhoanNguoiDung"("username");

-- CreateIndex
CREATE UNIQUE INDEX "TaiKhoanNguoiDung_nhanVienId_key" ON "TaiKhoanNguoiDung"("nhanVienId");

-- CreateIndex
CREATE UNIQUE INDEX "CongThucMon_monAnId_nguyenVatLieuId_key" ON "CongThucMon"("monAnId", "nguyenVatLieuId");

-- CreateIndex
CREATE UNIQUE INDEX "KhachHang_soDienThoai_key" ON "KhachHang"("soDienThoai");

-- CreateIndex
CREATE UNIQUE INDEX "CauHinhHeThong_key_key" ON "CauHinhHeThong"("key");

-- AddForeignKey
ALTER TABLE "NhanVien" ADD CONSTRAINT "NhanVien_vaiTroId_fkey" FOREIGN KEY ("vaiTroId") REFERENCES "VaiTro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaiTroQuyen" ADD CONSTRAINT "VaiTroQuyen_vaiTroId_fkey" FOREIGN KEY ("vaiTroId") REFERENCES "VaiTro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaiTroQuyen" ADD CONSTRAINT "VaiTroQuyen_quyenId_fkey" FOREIGN KEY ("quyenId") REFERENCES "Quyen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaiKhoanNguoiDung" ADD CONSTRAINT "TaiKhoanNguoiDung_nhanVienId_fkey" FOREIGN KEY ("nhanVienId") REFERENCES "NhanVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonAn" ADD CONSTRAINT "MonAn_danhMucId_fkey" FOREIGN KEY ("danhMucId") REFERENCES "DanhMucMon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CongThucMon" ADD CONSTRAINT "CongThucMon_monAnId_fkey" FOREIGN KEY ("monAnId") REFERENCES "MonAn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CongThucMon" ADD CONSTRAINT "CongThucMon_nguyenVatLieuId_fkey" FOREIGN KEY ("nguyenVatLieuId") REFERENCES "NguyenVatLieu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ban" ADD CONSTRAINT "Ban_khuVucId_fkey" FOREIGN KEY ("khuVucId") REFERENCES "KhuVucBan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonHang" ADD CONSTRAINT "DonHang_banId_fkey" FOREIGN KEY ("banId") REFERENCES "Ban"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonHang" ADD CONSTRAINT "DonHang_nhanVienId_fkey" FOREIGN KEY ("nhanVienId") REFERENCES "NhanVien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietDonHang" ADD CONSTRAINT "ChiTietDonHang_donHangId_fkey" FOREIGN KEY ("donHangId") REFERENCES "DonHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietDonHang" ADD CONSTRAINT "ChiTietDonHang_monAnId_fkey" FOREIGN KEY ("monAnId") REFERENCES "MonAn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietTuyChonMon" ADD CONSTRAINT "ChiTietTuyChonMon_chiTietDonHangId_fkey" FOREIGN KEY ("chiTietDonHangId") REFERENCES "ChiTietDonHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietTuyChonMon" ADD CONSTRAINT "ChiTietTuyChonMon_tuyChonMonId_fkey" FOREIGN KEY ("tuyChonMonId") REFERENCES "TuyChonMon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietTuyChonMon" ADD CONSTRAINT "ChiTietTuyChonMon_monAnId_fkey" FOREIGN KEY ("monAnId") REFERENCES "MonAn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoaDon" ADD CONSTRAINT "HoaDon_donHangId_fkey" FOREIGN KEY ("donHangId") REFERENCES "DonHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThanhToan" ADD CONSTRAINT "ThanhToan_hoaDonId_fkey" FOREIGN KEY ("hoaDonId") REFERENCES "HoaDon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaThuNgan" ADD CONSTRAINT "CaThuNgan_nhanVienId_fkey" FOREIGN KEY ("nhanVienId") REFERENCES "NhanVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatBan" ADD CONSTRAINT "DatBan_khachHangId_fkey" FOREIGN KEY ("khachHangId") REFERENCES "KhachHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatBan" ADD CONSTRAINT "DatBan_banId_fkey" FOREIGN KEY ("banId") REFERENCES "Ban"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichSuTichDiem" ADD CONSTRAINT "LichSuTichDiem_khachHangId_fkey" FOREIGN KEY ("khachHangId") REFERENCES "KhachHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonMuaHang" ADD CONSTRAINT "DonMuaHang_nhaCungCapId_fkey" FOREIGN KEY ("nhaCungCapId") REFERENCES "NhaCungCap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietDonMuaHang" ADD CONSTRAINT "ChiTietDonMuaHang_donMuaHangId_fkey" FOREIGN KEY ("donMuaHangId") REFERENCES "DonMuaHang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietDonMuaHang" ADD CONSTRAINT "ChiTietDonMuaHang_nguyenVatLieuId_fkey" FOREIGN KEY ("nguyenVatLieuId") REFERENCES "NguyenVatLieu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhieuNhapKho" ADD CONSTRAINT "PhieuNhapKho_donMuaHangId_fkey" FOREIGN KEY ("donMuaHangId") REFERENCES "DonMuaHang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhieuNhapKho" ADD CONSTRAINT "PhieuNhapKho_nhanVienId_fkey" FOREIGN KEY ("nhanVienId") REFERENCES "NhanVien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietNhapKho" ADD CONSTRAINT "ChiTietNhapKho_phieuNhapKhoId_fkey" FOREIGN KEY ("phieuNhapKhoId") REFERENCES "PhieuNhapKho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChiTietNhapKho" ADD CONSTRAINT "ChiTietNhapKho_nguyenVatLieuId_fkey" FOREIGN KEY ("nguyenVatLieuId") REFERENCES "NguyenVatLieu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NhatKyXuatKho" ADD CONSTRAINT "NhatKyXuatKho_nguyenVatLieuId_fkey" FOREIGN KEY ("nguyenVatLieuId") REFERENCES "NguyenVatLieu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichPhanCa" ADD CONSTRAINT "LichPhanCa_nhanVienId_fkey" FOREIGN KEY ("nhanVienId") REFERENCES "NhanVien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichPhanCa" ADD CONSTRAINT "LichPhanCa_caLamViecId_fkey" FOREIGN KEY ("caLamViecId") REFERENCES "CaLamViec"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChamCong" ADD CONSTRAINT "ChamCong_lichPhanCaId_fkey" FOREIGN KEY ("lichPhanCaId") REFERENCES "LichPhanCa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
