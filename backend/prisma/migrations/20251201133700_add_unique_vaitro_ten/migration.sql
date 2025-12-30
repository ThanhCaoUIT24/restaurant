/*
  Warnings:

  - A unique constraint covering the columns `[ten]` on the table `VaiTro` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "VaiTro_ten_key" ON "VaiTro"("ten");
