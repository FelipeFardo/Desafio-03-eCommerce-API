/*
  Warnings:

  - You are about to drop the column `code_postal` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `complement` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `number` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `orders` table. All the data in the column will be lost.
  - Added the required column `add_on_address` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_method` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zip_code` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "code_postal",
DROP COLUMN "complement",
DROP COLUMN "number",
DROP COLUMN "state",
ADD COLUMN     "add_on_address" TEXT NOT NULL,
ADD COLUMN     "addiotional_info" TEXT,
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "payment_method" TEXT NOT NULL,
ADD COLUMN     "province" TEXT NOT NULL,
ADD COLUMN     "zip_code" INTEGER NOT NULL;
