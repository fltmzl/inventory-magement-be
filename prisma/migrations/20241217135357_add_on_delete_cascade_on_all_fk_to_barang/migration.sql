-- DropForeignKey
ALTER TABLE "DetailPermintaanBarang" DROP CONSTRAINT "DetailPermintaanBarang_barang_id_fkey";

-- DropForeignKey
ALTER TABLE "DetailTransaksiBarangKeluar" DROP CONSTRAINT "DetailTransaksiBarangKeluar_barang_id_fkey";

-- DropForeignKey
ALTER TABLE "DetailTransaksiBarangMasuk" DROP CONSTRAINT "DetailTransaksiBarangMasuk_barang_id_fkey";

-- AddForeignKey
ALTER TABLE "DetailTransaksiBarangMasuk" ADD CONSTRAINT "DetailTransaksiBarangMasuk_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "Barang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPermintaanBarang" ADD CONSTRAINT "DetailPermintaanBarang_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "Barang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailTransaksiBarangKeluar" ADD CONSTRAINT "DetailTransaksiBarangKeluar_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "Barang"("id") ON DELETE CASCADE ON UPDATE CASCADE;
