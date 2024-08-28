/*
  Warnings:

  - Added the required column `price_in_cents_per_unit` to the `orders_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders_items" ADD COLUMN     "price_in_cents_per_unit" INTEGER NOT NULL;
