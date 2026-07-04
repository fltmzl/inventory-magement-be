import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('UserSeeder');

export const userSeeder = async () => {
  await prisma.pegawai.upsert({
    where: { id: '09f5b80f-45a5-4cb7-a969-73a03c482ef8' },
    update: {},
    create: {
      id: '09f5b80f-45a5-4cb7-a969-73a03c482ef8',
      alamat: 'Jl mawar',
      email: 'admin@gmail.com',
      foto: '',
      namaLengkap: 'Admin',
      password: '$2a$12$UvEqc6pnrtpNtPJ2Cqjcn.MseTlKKOyiVUSr1zDmnZym1BWR0P3i.', // "password"
      role: 'ADMIN',
      telepon: '0891351531',
      username: 'admin',
    },
  });

  logger.log('User seeder success');
};
