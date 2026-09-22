-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('INITIAL', 'IN', 'OUT', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "barang_id" TEXT NOT NULL,
    "nomorLot_id" TEXT,
    "tipe" "MovementType" NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "stokSebelum" INTEGER NOT NULL,
    "stokSesudah" INTEGER NOT NULL,
    "referensiId" TEXT,
    "keterangan" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockMovement_barang_id_idx" ON "StockMovement"("barang_id");

-- CreateIndex
CREATE INDEX "StockMovement_tanggal_idx" ON "StockMovement"("tanggal");

-- CreateIndex
CREATE INDEX "StockMovement_referensiId_idx" ON "StockMovement"("referensiId");

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "Barang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_nomorLot_id_fkey" FOREIGN KEY ("nomorLot_id") REFERENCES "NomorLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
