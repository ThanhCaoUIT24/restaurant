/*
  Warnings:

  - You are about to drop the `YeuCauHuyMon` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "YeuCauHuyMon" DROP CONSTRAINT "YeuCauHuyMon_donHangId_fkey";

-- DropForeignKey
ALTER TABLE "YeuCauHuyMon" DROP CONSTRAINT "YeuCauHuyMon_nguoiDuyetId_fkey";

-- DropForeignKey
ALTER TABLE "YeuCauHuyMon" DROP CONSTRAINT "YeuCauHuyMon_nguoiYeuCauId_fkey";

-- DropForeignKey
ALTER TABLE "YeuCauHuyMon" DROP CONSTRAINT "YeuCauHuyMon_orderItemId_fkey";

-- DropTable
DROP TABLE "YeuCauHuyMon";
