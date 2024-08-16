/*
  Warnings:

  - You are about to drop the column `descont` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "descont",
ADD COLUMN     "discount" INTEGER;
