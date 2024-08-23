/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `product_categorys` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `product_categorys` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "product_categorys" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "product_categorys_slug_key" ON "product_categorys"("slug");
