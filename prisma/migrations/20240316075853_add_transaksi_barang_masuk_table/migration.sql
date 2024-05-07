-- CreateTable
CREATE TABLE "TransaksiBarangMasuk" (
    "id" TEXT NOT NULL,
    "nomorLot_id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "hargaTotal" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransaksiBarangMasuk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailTransaksiBarangMasuk" (
    "transaksiBarangMasuk_id" TEXT NOT NULL,
    "barang_id" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "hargaSatuan" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "DetailTransaksiBarangMasuk_pkey" PRIMARY KEY ("transaksiBarangMasuk_id","barang_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransaksiBarangMasuk_nomorLot_id_key" ON "TransaksiBarangMasuk"("nomorLot_id");

-- AddForeignKey
ALTER TABLE "TransaksiBarangMasuk" ADD CONSTRAINT "TransaksiBarangMasuk_nomorLot_id_fkey" FOREIGN KEY ("nomorLot_id") REFERENCES "NomorLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailTransaksiBarangMasuk" ADD CONSTRAINT "DetailTransaksiBarangMasuk_transaksiBarangMasuk_id_fkey" FOREIGN KEY ("transaksiBarangMasuk_id") REFERENCES "TransaksiBarangMasuk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailTransaksiBarangMasuk" ADD CONSTRAINT "DetailTransaksiBarangMasuk_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
