import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { IdGenerator } from 'utils/core/idGenerator';

const prisma = new PrismaClient();
const logger = new Logger('BarangSeeder');

export const barangSeeder = async () => {
  await prisma.barang.deleteMany();
  await prisma.satuan.deleteMany();
  await prisma.kategori.deleteMany();

  const satuanKgId = 'f8dac0af-3bf3-482d-b7da-ccbfb0f39edf';
  const satuanPackId = 'd0b75e38-0126-4dd3-b283-d08c73677a7a';
  const satuanPcsId = '8795df9e-acae-4ff0-8800-b95ecbceb2cb';
  const satuanIkatId = '16581ebb-3d1a-48bd-ba86-5a2146932829';

  const kategoriSayurId = '3b534ec4-7119-4422-8199-dd36e3d76b2f';
  const kategoriBumbuId = 'e9f0f2c3-c5c2-47f8-92d2-f1c85a36af99';
  const kategoriBuahId = '3e67f105-62ca-42af-8afc-ff77fcc95c99';
  const kategoriBahanMentahId = '7973b414-b48a-4a0b-9743-177842d26a61';
  const kategoriLainnyaId = '6f7d5f6d-1e4a-4a2d-a2c1-5c4a3d6a4b5c';

  const barangData = [
    {
      nama: 'Abon',
      kategori_id: kategoriBahanMentahId,
      stok: 6,
      harga: 150_000,
      satuan_id: satuanKgId,
    },
    {
      nama: 'Alpukat',
      kategori_id: kategoriBuahId,
      stok: 20,
      harga: 35_000,
      satuan_id: satuanKgId,
    },
    {
      nama: 'Apel Malang',
      kategori_id: kategoriBuahId,
      stok: 15,
      harga: 25_000,
      satuan_id: satuanKgId,
    },
    {
      nama: 'Asam Jawa',
      kategori_id: kategoriBumbuId,
      stok: 10,
      harga: 10_000,
      satuan_id: satuanPackId,
    },
    {
      nama: 'Ayam Boiler',
      kategori_id: kategoriBahanMentahId,
      stok: 12,
      harga: 35_000,
      satuan_id: satuanKgId,
    },
    {
      nama: 'Baby Kailan',
      kategori_id: kategoriSayurId,
      stok: 8,
      harga: 20_000,
      satuan_id: satuanKgId,
    },
    {
      nama: 'Bakso Ikan BJ',
      kategori_id: kategoriBahanMentahId,
      stok: 50,
      harga: 5_000,
      satuan_id: satuanPcsId,
    },
    {
      nama: 'Bawang Bombay',
      kategori_id: kategoriBumbuId,
      stok: 25,
      harga: 30_000,
      satuan_id: satuanKgId,
    },
    {
      nama: 'Bawang Merah Goreng',
      kategori_id: kategoriBumbuId,
      stok: 10,
      harga: 60_000,
      satuan_id: satuanKgId,
    },
    {
      nama: 'Bawang Merah Kupas',
      kategori_id: kategoriBumbuId,
      stok: 20,
      harga: 45_000,
      satuan_id: satuanKgId,
    },
    {
      nama: 'Bawang Putih Kupas',
      kategori_id: kategoriBumbuId,
      stok: 18,
      harga: 40_000,
      satuan_id: satuanKgId,
    },
    {
      nama: 'Bayam',
      kategori_id: kategoriSayurId,
      stok: 30,
      harga: 5_000,
      satuan_id: satuanIkatId,
    },
    {
      nama: 'Belimbing',
      kategori_id: kategoriBuahId,
      stok: 22,
      harga: 20_000,
      satuan_id: satuanKgId,
    },
    {
      nama: 'Belimbing Wuluh',
      kategori_id: kategoriBuahId,
      stok: 15,
      harga: 15_000,
      satuan_id: satuanKgId,
    },
    {
      nama: 'Bengkoang',
      kategori_id: kategoriBuahId,
      stok: 15,
      harga: 10_000,
      satuan_id: satuanKgId,
    },
  ];

  const mappedBarangData = barangData.map((barang) => ({
    ...barang,
    id: IdGenerator.itemId(),
    pembelianTerakhir: new Date(),
  }));

  await prisma.satuan.createMany({
    data: [
      {
        kode: 'kg',
        nama: 'Kg',
        id: satuanKgId,
      },
      {
        kode: 'pack',
        nama: 'Pack',
        id: satuanPackId,
      },
      {
        kode: 'pcs',
        nama: 'Pcs',
        id: satuanPcsId,
      },
      {
        kode: 'ikat',
        nama: 'Ikat',
        id: satuanIkatId,
      },
    ],
  });

  await prisma.kategori.createMany({
    data: [
      {
        kode: 'K001',
        nama: 'Sayur',
        id: kategoriSayurId,
      },
      {
        kode: 'K002',
        nama: 'Bumbu',
        id: kategoriBumbuId,
      },
      {
        kode: 'K003',
        nama: 'Buah',
        id: kategoriBuahId,
      },
      {
        kode: 'K004',
        nama: 'Bahan Mentah',
        id: kategoriBahanMentahId,
      },
      {
        kode: 'K005',
        nama: 'Lainnya',
        id: kategoriLainnyaId,
      },
    ],
  });

  await prisma.barang.createMany({
    data: mappedBarangData,
  });

  logger.log('Barang seeder success');
};
