-- CreateTable
CREATE TABLE "TransaksiBarangKeluar" (
    "id" TEXT NOT NULL,
    "permintaanBarang_id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "hargaTotal" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransaksiBarangKeluar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailTransaksiBarangKeluar" (
    "transaksiBarangKeluar_id" TEXT NOT NULL,
    "barang_id" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "hargaSatuan" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "DetailTransaksiBarangKeluar_pkey" PRIMARY KEY ("transaksiBarangKeluar_id","barang_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransaksiBarangKeluar_permintaanBarang_id_key" ON "TransaksiBarangKeluar"("permintaanBarang_id");

-- AddForeignKey
ALTER TABLE "TransaksiBarangKeluar" ADD CONSTRAINT "TransaksiBarangKeluar_permintaanBarang_id_fkey" FOREIGN KEY ("permintaanBarang_id") REFERENCES "PermintaanBarang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailTransaksiBarangKeluar" ADD CONSTRAINT "DetailTransaksiBarangKeluar_transaksiBarangKeluar_id_fkey" FOREIGN KEY ("transaksiBarangKeluar_id") REFERENCES "TransaksiBarangKeluar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailTransaksiBarangKeluar" ADD CONSTRAINT "DetailTransaksiBarangKeluar_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
