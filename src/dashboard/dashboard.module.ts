import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { BarangModule } from 'src/barang/barang.module';
import { PermintaanBarangModule } from 'src/permintaan-barang/permintaan-barang.module';
import { PelangganModule } from 'src/pelanggan/pelanggan.module';
import { DashboardController } from './dashboard.controller';
import { TransaksiBarangKeluarModule } from 'src/transaksi-barang-keluar/transaksi-barang-keluar.module';

@Module({
  imports: [
    BarangModule,
    PermintaanBarangModule,
    PelangganModule,
    TransaksiBarangKeluarModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
