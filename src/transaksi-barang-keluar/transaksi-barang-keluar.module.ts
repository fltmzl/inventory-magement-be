import { Module } from '@nestjs/common';
import { TransaksiBarangKeluarService } from './transaksi-barang-keluar.service';
import { TransaksiBarangKeluarController } from './transaksi-barang-keluar.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [TransaksiBarangKeluarController],
  providers: [TransaksiBarangKeluarService, PrismaService],
})
export class TransaksiBarangKeluarModule {}
