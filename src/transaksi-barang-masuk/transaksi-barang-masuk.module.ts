import { Module } from '@nestjs/common';
import { TransaksiBarangMasukService } from './transaksi-barang-masuk.service';
import { TransaksiBarangMasukController } from './transaksi-barang-masuk.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [TransaksiBarangMasukController],
  providers: [TransaksiBarangMasukService, PrismaService],
})
export class TransaksiBarangMasukModule {}
