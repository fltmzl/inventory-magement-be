/*
  Warnings:

  - The primary key for the `DetailTransaksiBarangKeluar` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `nomorLot_id` to the `DetailTransaksiBarangKeluar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DetailTransaksiBarangKeluar" DROP CONSTRAINT "DetailTransaksiBarangKeluar_pkey",
ADD COLUMN     "nomorLot_id" TEXT NOT NULL,
ADD CONSTRAINT "DetailTransaksiBarangKeluar_pkey" PRIMARY KEY ("transaksiBarangKeluar_id", "barang_id", "nomorLot_id");

-- AddForeignKey
ALTER TABLE "DetailTransaksiBarangKeluar" ADD CONSTRAINT "DetailTransaksiBarangKeluar_nomorLot_id_fkey" FOREIGN KEY ("nomorLot_id") REFERENCES "NomorLot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
