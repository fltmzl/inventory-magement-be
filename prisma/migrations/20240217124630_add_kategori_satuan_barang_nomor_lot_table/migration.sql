-- CreateTable
CREATE TABLE "Kategori" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Satuan" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Satuan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Barang" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori_id" TEXT NOT NULL,
    "satuan_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Barang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NomorLot" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NomorLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailNomorLotBarang" (
    "nomorLot_id" TEXT NOT NULL,
    "barang_id" TEXT NOT NULL,

    CONSTRAINT "DetailNomorLotBarang_pkey" PRIMARY KEY ("nomorLot_id","barang_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kategori_kode_key" ON "Kategori"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "Satuan_kode_key" ON "Satuan"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "NomorLot_kode_key" ON "NomorLot"("kode");

-- AddForeignKey
ALTER TABLE "Barang" ADD CONSTRAINT "Barang_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "Kategori"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Barang" ADD CONSTRAINT "Barang_satuan_id_fkey" FOREIGN KEY ("satuan_id") REFERENCES "Satuan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailNomorLotBarang" ADD CONSTRAINT "DetailNomorLotBarang_nomorLot_id_fkey" FOREIGN KEY ("nomorLot_id") REFERENCES "NomorLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailNomorLotBarang" ADD CONSTRAINT "DetailNomorLotBarang_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
