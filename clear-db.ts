import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database tables...');
  await prisma.$executeRawUnsafe(`DELETE FROM "DetailTransaksiBarangMasuk";`);
  await prisma.$executeRawUnsafe(`DELETE FROM "DetailTransaksiBarangKeluar";`);
  await prisma.$executeRawUnsafe(`DELETE FROM "DetailPermintaanBarang";`);
  await prisma.$executeRawUnsafe(`DELETE FROM "DetailNomorLotBarang";`);
  await prisma.$executeRawUnsafe(`DELETE FROM "StockMovement";`);
  await prisma.$executeRawUnsafe(`DELETE FROM "TransaksiBarangMasuk";`);
  await prisma.$executeRawUnsafe(`DELETE FROM "TransaksiBarangKeluar";`);
  await prisma.$executeRawUnsafe(`DELETE FROM "PermintaanBarang";`);
  await prisma.$executeRawUnsafe(`DELETE FROM "NomorLot";`);
  console.log('Database tables cleared successfully.');
}

main()
  .catch((e) => {
    console.error('Error clearing database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
