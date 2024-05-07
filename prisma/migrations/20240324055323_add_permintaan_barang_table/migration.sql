-- CreateTable
CREATE TABLE "PermintaanBarang" (
    "id" TEXT NOT NULL,
    "pelanggan_id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "permintaanTerpenuhi" BOOLEAN NOT NULL DEFAULT false,
    "pegawai_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermintaanBarang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailPermintaanBarang" (
    "permintaanBarang_id" TEXT NOT NULL,
    "barang_id" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,

    CONSTRAINT "DetailPermintaanBarang_pkey" PRIMARY KEY ("permintaanBarang_id","barang_id")
);

-- AddForeignKey
ALTER TABLE "PermintaanBarang" ADD CONSTRAINT "PermintaanBarang_pelanggan_id_fkey" FOREIGN KEY ("pelanggan_id") REFERENCES "Pelanggan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermintaanBarang" ADD CONSTRAINT "PermintaanBarang_pegawai_id_fkey" FOREIGN KEY ("pegawai_id") REFERENCES "Pegawai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPermintaanBarang" ADD CONSTRAINT "DetailPermintaanBarang_permintaanBarang_id_fkey" FOREIGN KEY ("permintaanBarang_id") REFERENCES "PermintaanBarang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPermintaanBarang" ADD CONSTRAINT "DetailPermintaanBarang_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
