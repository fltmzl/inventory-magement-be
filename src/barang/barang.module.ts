import { Module } from '@nestjs/common';
import { BarangService } from './barang.service';
import { BarangController } from './barang.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [BarangController],
  providers: [BarangService, PrismaService],
})
export class BarangModule {}
