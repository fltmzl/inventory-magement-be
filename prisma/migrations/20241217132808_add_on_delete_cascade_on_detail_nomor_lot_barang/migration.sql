-- DropForeignKey
ALTER TABLE "DetailNomorLotBarang" DROP CONSTRAINT "DetailNomorLotBarang_barang_id_fkey";

-- DropForeignKey
ALTER TABLE "DetailNomorLotBarang" DROP CONSTRAINT "DetailNomorLotBarang_nomorLot_id_fkey";

-- AddForeignKey
ALTER TABLE "DetailNomorLotBarang" ADD CONSTRAINT "DetailNomorLotBarang_nomorLot_id_fkey" FOREIGN KEY ("nomorLot_id") REFERENCES "NomorLot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailNomorLotBarang" ADD CONSTRAINT "DetailNomorLotBarang_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "Barang"("id") ON DELETE CASCADE ON UPDATE CASCADE;
