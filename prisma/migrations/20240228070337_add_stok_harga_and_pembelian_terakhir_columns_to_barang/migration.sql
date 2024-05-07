/*
  Warnings:

  - Added the required column `harga` to the `Barang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pembelianTerakhir` to the `Barang` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stok` to the `Barang` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Barang" ADD COLUMN     "harga" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "pembelianTerakhir" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "stok" INTEGER NOT NULL;
