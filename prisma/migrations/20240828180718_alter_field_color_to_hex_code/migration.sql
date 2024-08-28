/*
  Warnings:

  - You are about to drop the column `color` on the `product_colors` table. All the data in the column will be lost.
  - Added the required column `hexCode` to the `product_colors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product_colors" DROP COLUMN "color",
ADD COLUMN     "hexCode" TEXT NOT NULL;
