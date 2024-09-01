import { Injectable } from '@nestjs/common';
import { CreateBarangDto } from './dto/create-barang.dto';
import { UpdateBarangDto } from './dto/update-barang.dto';
import { PrismaService } from 'src/prisma.service';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
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

  // @Cron(CronExpression.EVERY_5_MINUTES)
  // handleCron() {
  //   console.log('CRON EMAIL JALAN');
  //   this.mailService.sendEmail();
  // }

  async onModuleInit() {
    // await this.setupStockCheckJob();
  }

  async setupStockCheckJob(intervalInSeconds: number = 10) {
    const job = new CronJob(`*/${intervalInSeconds} * * * * *`, () => {
      // const job = new CronJob(CronExpression.EVERY_5_SECONDS, () => {
      console.log('CRON JOB CHECK STOK');
    });
    this.schedulerRegistry.addCronJob(this.CRON_JOB_STOCK, job);
    job.start();
    console.log('JOB START');
  }

  async updateStockCheckInterval(newIntervalInSeconds: number) {
    // Remove the old job
    const job = this.schedulerRegistry.getCronJob(this.CRON_JOB_STOCK);
    job.stop();
    this.schedulerRegistry.deleteCronJob(this.CRON_JOB_STOCK);

    // Add and start the updated job
    await this.setupStockCheckJob(newIntervalInSeconds);
  }

  async create(createBarangDto: CreateBarangDto) {
    const barang = await this.prisma.barang.create({
      data: createBarangDto,
    });

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
    });

    return {
      data: barang,
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
    const barang = await this.prisma.barang.update({
      where: { id },
      data: updateBarangDto,
      select: {
        id: true,
      },
    });

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
}
