/*
  Warnings:

  - You are about to drop the column `discount` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `price_in_cents` on the `products` table. All the data in the column will be lost.
  - Added the required column `price_in_cents` to the `product_variants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "discount" INTEGER,
ADD COLUMN     "price_in_cents" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "discount",
DROP COLUMN "price_in_cents";
