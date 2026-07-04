/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreateTransaksiBarangMasukDto } from './dto/create-transaksi-barang-masuk.dto';
import { UpdateTransaksiBarangMasukDto } from './dto/update-transaksi-barang-masuk.dto';
import { PrismaService } from 'src/prisma.service';
import { timestampToISOString } from 'utils/time.util';

@Injectable()
export class TransaksiBarangMasukService {
  constructor(private prisma: PrismaService) {}

  async create(createTransaksiBarangMasukDto: CreateTransaksiBarangMasukDto) {
    const { id, barang, hargaTotal, nomorLot, tanggal } =
      createTransaksiBarangMasukDto;

    const mappedItems = barang.map((item) => ({
      barang_id: item.id,
      hargaSatuan: item.hargaSatuan,
      jumlah: item.jumlah,
    }));

    const mappedItemsOnlyIds = barang.map((item) => {
      return {
        barang_id: item.id,
        totalBarang: item.jumlah,
      };
    });

    const queryForIncrementStock = mappedItems.map((item) => {
      return this.prisma.barang.update({
        where: { id: item.barang_id },
        data: {
          stok: {
            increment: item.jumlah,
          },
        },
      });
    });

    const [transaksiBarang] = await this.prisma.$transaction([
      // Create transaksi barang masuk
      this.prisma.transaksiBarangMasuk.create({
        data: {
          id,
          tanggal,
          hargaTotal,
          nomorLot: {
            create: {
              kode: nomorLot,
              barang: {
                createMany: {
                  data: mappedItemsOnlyIds,
                },
              },
            },
          },
          barang: {
            createMany: {
              data: mappedItems,
            },
          },
        },
      }),

      // Update stock
      ...queryForIncrementStock,
    ]);

    return {
      data: transaksiBarang,
      message: 'Transaksi barang masuk berhasil ditambahkan',
    };
  }

  async findAll() {
    const transaksiBarang = await this.prisma.transaksiBarangMasuk.findMany({
      include: {
        barang: {
          select: {
            barang_id: true,
            barang: {
              select: {
                nama: true,
                satuan: {
                  select: {
                    nama: true,
                  },
                },
              },
            },
            jumlah: true,
            hargaSatuan: true,
          },
        },
        nomorLot: {
          select: {
            kode: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const mappedTransaksiBarang = transaksiBarang.map((transaksiItem) => ({
      ...transaksiItem,
      nomorLot: transaksiItem.nomorLot.kode,
      barang: transaksiItem.barang.map((barangItem) => ({
        id: barangItem.barang_id,
        nama: barangItem.barang.nama,
        satuan: barangItem.barang.satuan.nama,
        jumlah: barangItem.jumlah,
        hargaSatuan: barangItem.hargaSatuan,
      })),
    }));

    return {
      data: mappedTransaksiBarang,
      meta: {
        totalItems: transaksiBarang.length,
      },
    };
  }

  async getReport(dateFrom: number, dateTo: number) {
    const whereCondition = {
      tanggal: {
        gte: timestampToISOString(1),
        lte: timestampToISOString(new Date().getTime()),
      },
    };

    if (dateFrom) {
      whereCondition.tanggal.gte = timestampToISOString(dateFrom);
    }

    if (dateTo) {
      whereCondition.tanggal.lte = timestampToISOString(dateTo);
    }

    const transaksiBarangMasuk =
      await this.prisma.transaksiBarangMasuk.findMany({
        where: whereCondition,
        include: {
          barang: {
            select: {
              barang_id: true,
              jumlah: true,
              hargaSatuan: true,
              barang: {
                select: {
                  nama: true,
                  satuan: {
                    select: {
                      nama: true,
                    },
                  },
                },
              },
            },
          },
          nomorLot: {
            select: {
              id: true,
              kode: true,
            },
          },
        },
      });

    const mappedTransaksiBarangMasuk = transaksiBarangMasuk.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { barang, nomorLot_id, ...others } = item;

      return {
        ...others,
        barang: barang.map((barangItem) => {
          return {
            id: barangItem.barang_id,
            nama: barangItem.barang.nama,
            satuan: barangItem.barang.satuan.nama,
            jumlah: barangItem.jumlah,
            hargaSatuan: barangItem.hargaSatuan,
          };
        }),
      };
    });

    return {
      data: mappedTransaksiBarangMasuk,
      meta: {
        totalItems: transaksiBarangMasuk.length,
      },
    };
  }

  async findOne(id: string) {
    const transaksiBarang = await this.prisma.transaksiBarangMasuk.findUnique({
      where: { id },
      include: {
        barang: {
          select: {
            barang_id: true,
            barang: {
              select: {
                nama: true,
                satuan: {
                  select: {
                    nama: true,
                  },
                },
              },
            },
            jumlah: true,
            hargaSatuan: true,
          },
        },
        nomorLot: {
          select: {
            kode: true,
          },
        },
      },
    });

    const mappedTransaksiBarang = {
      ...transaksiBarang,
      nomorLot: transaksiBarang.nomorLot.kode,
      barang: transaksiBarang.barang.map((barangItem) => ({
        id: barangItem.barang_id,
        nama: barangItem.barang.nama,
        satuan: barangItem.barang.satuan.nama,
        jumlah: barangItem.jumlah,
        hargaSatuan: barangItem.hargaSatuan,
      })),
    };

    return {
      data: mappedTransaksiBarang,
    };
  }

  async update(
    id: string,
    updateTransaksiBarangMasukDto: UpdateTransaksiBarangMasukDto,
  ) {
    return `This action updates a #${id} transaksiBarangMasuk`;
  }

  async remove(id: string) {
    const detailTransaksiBarangMasuk =
      await this.prisma.detailTransaksiBarangMasuk.deleteMany({
        where: {
          transaksiBarangMasuk_id: id,
        },
      });

    const transaksiBarangMasuk = await this.prisma.transaksiBarangMasuk.delete({
      where: { id },
    });

    return {
      data: transaksiBarangMasuk,
      message: 'Transaksi barang masuk berhasil dihapus',
    };
  }
}
