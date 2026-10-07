import { Injectable } from '@nestjs/common';
import { CreateBarangDto } from './dto/create-barang.dto';
import { UpdateBarangDto } from './dto/update-barang.dto';
import { PrismaService } from 'src/prisma.service';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { MailService } from 'src/auth/mail.service';
import { CronJob } from 'cron';

@Injectable()
export class BarangService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  private CRON_JOB_STOCK = 'stockCheckJob';
  private SCHEDULER_INTERVAL_IN_HOURS = 1;

  // @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron(items?: any[]) {
    console.log('CRON EMAIL JALAN', new Date().getHours());
    try {
      const stockItems = items ?? (await this.getLowStock(3)).data;
      await this.mailService.sendStockAlertEmail(stockItems);
      console.log('CRON EMAIL: Notifikasi email berhasil dikirim');
    } catch (error) {
      console.error('CRON EMAIL GAGAL:', error?.message || error);
    }
  }

  getCurrentTime(): string {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  }

  async onModuleInit() {
    await this.setupStockCheckJob();
  }

  async setupStockCheckJob(
    cronExpression: string = CronExpression.EVERY_WEEK,
    // cronExpression: string = CronExpression.EVERY_MINUTE,
  ) {
    // =========================================================================
    // PILIHAN JADWAL CRON (Bisa dipilih/di-uncomment sesuai kebutuhan):
    // -------------------------------------------------------------------------
    // 1. Setiap hari jam 6 pagi (Aktif saat ini):
    //    CronExpression.EVERY_DAY_AT_6AM ('0 0 6 * * *')
    //
    // 2. Interval Jam (contoh: setiap X jam):
    //    `0 0-23/${this.SCHEDULER_INTERVAL_IN_HOURS} * * *`
    //
    // 3. Interval Menit (contoh: setiap 5 menit):
    //    CronExpression.EVERY_5_MINUTES
    //
    // 4. Interval Detik (untuk keperluan testing/demo):
    //    CronExpression.EVERY_5_SECONDS
    // =========================================================================

    const selectedCron = cronExpression;

    const job = new CronJob(selectedCron, async () => {
      console.log('CRON JOB CHECK STOK', this.getCurrentTime());
      const lowStock = await this.getLowStock(3);
      console.log({ lowStock: lowStock.data });
      await this.handleCron(lowStock.data);
    });

    this.schedulerRegistry.addCronJob(this.CRON_JOB_STOCK, job);
    job.start();
    console.log('JOB START');
  }

  async updateStockCheckInterval(newIntervalInSeconds: number) {
    // Hapus cron job lama jika ada
    const job = this.schedulerRegistry.getCronJob(this.CRON_JOB_STOCK);
    if (job) {
      job.stop();
      this.schedulerRegistry.deleteCronJob(this.CRON_JOB_STOCK);
    }

    // Jalankan cron job baru berdasarkan interval detik yang dikirim
    const cron = `*/${newIntervalInSeconds} * * * * *`;
    await this.setupStockCheckJob(cron);
  }

  async create(createBarangDto: CreateBarangDto) {
    const barang = await this.prisma.barang.create({
      data: createBarangDto,
    });

    if (createBarangDto.stok && createBarangDto.stok > 0) {
      await this.prisma.stockMovement.create({
        data: {
          barang_id: barang.id,
          tipe: 'INITIAL',
          jumlah: createBarangDto.stok,
          stokSebelum: 0,
          stokSesudah: createBarangDto.stok,
          referensiId: barang.id,
          keterangan: 'Inisialisasi saldo awal barang',
          tanggal: new Date(),
        },
      });
    }

    return {
      data: barang,
      message: 'Barang ditambahkan',
    };
  }

  async findAll() {
    const barang = await this.prisma.barang.findMany({
      include: {
        kategori: {
          select: {
            id: true,
            kode: true,
            nama: true,
          },
        },
        nomorLot: {
          select: {
            nomorLot: {
              select: {
                kode: true,
              },
            },
          },
        },
        satuan: {
          select: {
            id: true,
            kode: true,
            nama: true,
          },
        },
      },
      orderBy: {
        nama: 'asc',
      },
    });

    const mappedBarang = barang.map((item) => {
      return {
        ...item,
        nomorLot: item.nomorLot.map((lot) => lot.nomorLot.kode),
        harga: Number(item.harga),
      };
    });

    return {
      data: mappedBarang,
      meta: {
        totalItems: barang.length,
      },
    };
  }

  async findOne(id: string) {
    const barang = await this.prisma.barang.findFirst({
      where: { id },
      include: {
        kategori: {
          select: {
            id: true,
            kode: true,
            nama: true,
          },
        },
        nomorLot: {
          select: {
            nomorLot_id: true,
          },
        },
        satuan: {
          select: {
            id: true,
            kode: true,
            nama: true,
          },
        },
      },
    });

    return {
      data: barang,
    };
  }

  async update(id: string, updateBarangDto: UpdateBarangDto) {
    const existingBarang = await this.prisma.barang.findUnique({
      where: { id },
      select: { stok: true },
    });

    const barang = await this.prisma.barang.update({
      where: { id },
      data: updateBarangDto,
      select: {
        id: true,
      },
    });

    if (
      existingBarang &&
      updateBarangDto.stok !== undefined &&
      updateBarangDto.stok !== existingBarang.stok
    ) {
      const diff = updateBarangDto.stok - existingBarang.stok;
      await this.prisma.stockMovement.create({
        data: {
          barang_id: id,
          tipe: 'ADJUSTMENT',
          jumlah: diff,
          stokSebelum: existingBarang.stok,
          stokSesudah: updateBarangDto.stok,
          referensiId: `ADJ-${Date.now()}`,
          keterangan: 'Penyesuaian stok manual / Stock opname',
          tanggal: new Date(),
        },
      });
    }

    return {
      data: {
        id: barang.id,
      },
      message: 'Barang berhasil diperbarui',
    };
  }

  async remove(id: string) {
    const barang = await this.prisma.barang.delete({
      where: { id },
    });

    return {
      data: {
        id: barang.id,
      },
      message: 'Barang berhasil dihapus',
    };
  }

  async count(): Promise<number> {
    const total = await this.prisma.barang.count();

    return total;
  }

  async getLowStock(maxStock: number) {
    const barang = await this.prisma.barang.findMany({
      where: {
        stok: {
          lte: maxStock,
        },
      },
      orderBy: {
        stok: 'asc',
      },
      include: {
        kategori: {
          select: { nama: true },
        },
        satuan: {
          select: { nama: true },
        },
      },
    });

    const mappedBarang = barang.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { kategori_id, satuan_id, harga, harga_jual, ...rest } = item;

      return {
        ...rest,
        harga: Number(harga),
        harga_jual: Number(harga_jual || 0),
        kategori: item.kategori?.nama,
        satuan: item.satuan?.nama,
      };
    });

    return {
      data: mappedBarang,
      meta: {
        totalItems: barang.length,
      },
    };
  }

  async getLotNumberId() {
    const today = new Date();

    // Set waktu awal dan akhir hari
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    const lotNumber = await this.prisma.nomorLot.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const countedLotNumber = lotNumber.toString().padStart(3, '0');

    const date2Digit = today.getDate().toString().padStart(2, '0');
    const month2Digit = (today.getMonth() + 1).toString().padStart(2, '0');
    const year2Digit = today.getFullYear().toString().slice(-2);

    const generatedLotNumber = `LOT${date2Digit}${month2Digit}${year2Digit}${countedLotNumber}`;

    return {
      data: generatedLotNumber,
    };
  }
}
