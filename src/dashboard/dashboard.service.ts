import { Injectable } from '@nestjs/common';
import { BarangService } from 'src/barang/barang.service';
import { PelangganService } from 'src/pelanggan/pelanggan.service';
import { PermintaanBarangService } from 'src/permintaan-barang/permintaan-barang.service';
import { TransaksiBarangKeluarService } from 'src/transaksi-barang-keluar/transaksi-barang-keluar.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly barangService: BarangService,
    private readonly permintaanBarangService: PermintaanBarangService,
    private readonly pelangganService: PelangganService,
    private readonly transaksiBarangKeluarService: TransaksiBarangKeluarService,
  ) {}

  async getSummary() {
    const barang = this.barangService.count();
    const permintaanBarang = this.permintaanBarangService.count();
    const pelanggan = this.pelangganService.count();

    const [totalBarang, totalPermintaanBarang, totalPelanggan] =
      await Promise.all([barang, permintaanBarang, pelanggan]);

    return {
      data: {
        totalBarang,
        totalPermintaanBarang,
        totalPelanggan,
      },
    };
  }

  async getLowSupplies(maxStock: number) {
    return await this.barangService.getLowStock(maxStock);
  }

  async getBestSelling(limit: number) {
    return await this.transaksiBarangKeluarService.getBestSellingItems(limit);
  }
}
