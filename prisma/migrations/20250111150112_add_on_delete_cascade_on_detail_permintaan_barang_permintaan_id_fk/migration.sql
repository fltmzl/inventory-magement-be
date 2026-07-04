-- DropForeignKey
ALTER TABLE "DetailPermintaanBarang" DROP CONSTRAINT "DetailPermintaanBarang_permintaanBarang_id_fkey";

-- AddForeignKey
ALTER TABLE "DetailPermintaanBarang" ADD CONSTRAINT "DetailPermintaanBarang_permintaanBarang_id_fkey" FOREIGN KEY ("permintaanBarang_id") REFERENCES "PermintaanBarang"("id") ON DELETE CASCADE ON UPDATE CASCADE;
