import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fungsi untuk mendapatkan random persentase
function getRandomMarkup(min: number, max: number) {
  return (Math.random() * (max - min) + min) / 100;
}

async function main() {
  console.log('Mulai menghitung dan mengupdate harga_jual...');

  const semuaBarang = await prisma.barang.findMany({
    include: { kategori: true },
  });

  for (const barang of semuaBarang) {
    let markup = 0;
    const kodeKategori = barang.kategori.kode;
    const namaBarang = barang.nama.toLowerCase();

    // Logika Markup sesuai kesepakatan Anda sebelumnya
    if (kodeKategori === 'K001' || kodeKategori === 'K003') {
      // Sayur & Buah segar
      markup = getRandomMarkup(15, 25);
    } else if (
      namaBarang.includes('tahu') ||
      namaBarang.includes('tempe') ||
      namaBarang.includes('telur') ||
      namaBarang.includes('ayam')
    ) {
      // Protein
      markup = getRandomMarkup(10, 20);
    } else if (kodeKategori === 'K002') {
      // Bumbu
      markup = getRandomMarkup(20, 35);
    } else {
      // Bahan mentah lainnya / olahan
      markup = getRandomMarkup(15, 25);
    }

    // Rumus: Harga Jual = Harga Beli + (Harga Beli * Markup)
    const hargaBeli = Number(barang.harga);
    let hargaJual = hargaBeli + hargaBeli * markup;

    // Pembulatan ke atas kelipatan 500 (biar harga cantik, misal 2300 jadi 2500)
    hargaJual = Math.ceil(hargaJual / 500) * 500;

    await prisma.barang.update({
      where: { id: barang.id },
      data: { harga_jual: hargaJual },
    });
  }

  console.log(
    '✅ Update harga_jual selesai! Data siap digunakan untuk seed transaksi.',
  );
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
