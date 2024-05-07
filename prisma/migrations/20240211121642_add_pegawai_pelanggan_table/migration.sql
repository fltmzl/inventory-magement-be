-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OWNER');

-- CreateTable
CREATE TABLE "Pegawai" (
    "id" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "foto" TEXT NOT NULL,
    "telepon" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pegawai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pelanggan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "telepon" TEXT NOT NULL,
    "email" TEXT,
    "alamat" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pelanggan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pegawai_username_key" ON "Pegawai"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Pegawai_email_key" ON "Pegawai"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Pegawai_telepon_key" ON "Pegawai"("telepon");

-- CreateIndex
CREATE UNIQUE INDEX "Pelanggan_telepon_key" ON "Pelanggan"("telepon");

-- CreateIndex
CREATE UNIQUE INDEX "Pelanggan_email_key" ON "Pelanggan"("email");
