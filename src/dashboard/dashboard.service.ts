import { Injectable } from '@nestjs/common';
import { BarangService } from 'src/barang/barang.service';
import { PelangganService } from 'src/pelanggan/pelanggan.service';
import { PermintaanBarangService } from 'src/permintaan-barang/permintaan-barang.service';
import { TransaksiBarangKeluarService } from 'src/transaksi-barang-keluar/transaksi-barang-keluar.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly barangService: BarangService,
    private readonly permintaanBarangService: PermintaanBarangService,
    private readonly pelangganService: PelangganService,
    private readonly transaksiBarangKeluarService: TransaksiBarangKeluarService,
    private readonly prisma: PrismaService,
  ) {}

  async getSummary() {
    const [
      totalBarang,
      totalPermintaanBarang,
      totalPelanggan,
      barangPrices,
      totalPendingRequests,
      totalFulfilledRequests,
    ] = await Promise.all([
      this.barangService.count(),
      this.permintaanBarangService.count(),
      this.pelangganService.count(),
      this.prisma.barang.findMany({ select: { stok: true, harga: true } }),
      this.prisma.permintaanBarang.count({
        where: { permintaanTerpenuhi: false },
      }),
      this.prisma.permintaanBarang.count({
        where: { permintaanTerpenuhi: true },
      }),
    ]);

    const totalAssetValuation = barangPrices.reduce(
      (acc, item) => acc + item.stok * Number(item.harga),
      0,
    );

    return {
      data: {
        totalBarang,
        totalPermintaanBarang,
        totalPelanggan,
        totalAssetValuation,
        totalPendingRequests,
        totalFulfilledRequests,
      },
    };
  }

  async getLowSupplies(maxStock: number) {
    return await this.barangService.getLowStock(maxStock);
  }

  async getBestSelling(limit: number) {
    return await this.transaksiBarangKeluarService.getBestSellingItems(limit);
  }

  async getTransactionTrend() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [masuk, keluar] = await Promise.all([
      this.prisma.transaksiBarangMasuk.findMany({
        where: { tanggal: { gte: thirtyDaysAgo } },
        select: {
          tanggal: true,
          barang: { select: { jumlah: true } },
        },
      }),
      this.prisma.transaksiBarangKeluar.findMany({
        where: { tanggal: { gte: thirtyDaysAgo } },
        select: {
          tanggal: true,
          barang: { select: { jumlah: true } },
        },
      }),
    ]);

    const trendMap = new Map<
      string,
      { tanggal: string; masuk: number; keluar: number }
    >();

    // Initialize all 30 days
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      trendMap.set(dateStr, { tanggal: dateStr, masuk: 0, keluar: 0 });
    }

    masuk.forEach((t) => {
      const dateStr = new Date(t.tanggal).toISOString().split('T')[0];
      if (trendMap.has(dateStr)) {
        const totalJumlah = t.barang.reduce((acc, b) => acc + b.jumlah, 0);
        trendMap.get(dateStr)!.masuk += totalJumlah;
      }
    });

    keluar.forEach((t) => {
      const dateStr = new Date(t.tanggal).toISOString().split('T')[0];
      if (trendMap.has(dateStr)) {
        const totalJumlah = t.barang.reduce((acc, b) => acc + b.jumlah, 0);
        trendMap.get(dateStr)!.keluar += totalJumlah;
      }
    });

    return {
      data: Array.from(trendMap.values()).reverse(),
    };
  }

  async getRecentActivities() {
    const [recentMasuk, recentKeluar] = await Promise.all([
      this.prisma.transaksiBarangMasuk.findMany({
        take: 5,
        orderBy: { tanggal: 'desc' },
        include: { nomorLot: true },
      }),
      this.prisma.transaksiBarangKeluar.findMany({
        take: 5,
        orderBy: { tanggal: 'desc' },
        include: { permintaanBarang: { include: { pelanggan: true } } },
      }),
    ]);

    const activities = [
      ...recentMasuk.map((t) => ({
        id: t.id,
        tipe: 'MASUK',
        keterangan: `Restok barang masuk dengan Nomor Lot: ${t.nomorLot.kode}`,
        tanggal: t.tanggal,
        hargaTotal: Number(t.hargaTotal),
      })),
      ...recentKeluar.map((t) => ({
        id: t.id,
        tipe: 'KELUAR',
        keterangan: `Pengiriman barang keluar untuk pelanggan: ${t.permintaanBarang.pelanggan.nama}`,
        tanggal: t.tanggal,
        hargaTotal: Number(t.hargaTotal),
      })),
    ];

    activities.sort((a, b) => b.tanggal.getTime() - a.tanggal.getTime());

    return {
      data: activities.slice(0, 5),
    };
  }

  async getCategoryDistribution() {
    const categories = await this.prisma.kategori.findMany({
      include: {
        barang: {
          select: { stok: true },
        },
      },
    });

    const data = categories.map((cat) => ({
      kategori: cat.nama,
      totalStok: cat.barang.reduce((sum, b) => sum + b.stok, 0),
    }));

    return {
      data,
    };
  }
}
