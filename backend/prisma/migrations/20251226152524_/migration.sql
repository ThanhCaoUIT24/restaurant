/*
  Warnings:

  - You are about to drop the `VoidRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VoidRequest" DROP CONSTRAINT "VoidRequest_orderId_fkey";

-- DropForeignKey
ALTER TABLE "VoidRequest" DROP CONSTRAINT "VoidRequest_orderItemId_fkey";

-- DropTable
DROP TABLE "VoidRequest";
