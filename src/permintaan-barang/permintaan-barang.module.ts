import { Module } from '@nestjs/common';
import { PermintaanBarangService } from './permintaan-barang.service';
import { PermintaanBarangController } from './permintaan-barang.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [PermintaanBarangController],
  providers: [PermintaanBarangService, PrismaService],
})
export class PermintaanBarangModule {}
