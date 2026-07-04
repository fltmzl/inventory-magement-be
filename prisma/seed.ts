import { PrismaClient } from '@prisma/client';
import { userSeeder } from './seeder/userSeeder';
import { barangSeeder } from './seeder/barangSeeder';

const prisma = new PrismaClient();

async function main() {
  userSeeder();
  barangSeeder();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
