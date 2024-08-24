/*
  Warnings:

  - You are about to drop the column `companyName` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "companyName",
ADD COLUMN     "company_name" TEXT,
ALTER COLUMN "zip_code" SET DATA TYPE TEXT;
