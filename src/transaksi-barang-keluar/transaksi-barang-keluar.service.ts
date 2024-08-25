import { Injectable } from '@nestjs/common';
import { CreateTransaksiBarangKeluarDto } from './dto/create-transaksi-barang-keluar.dto';
import { UpdateTransaksiBarangKeluarDto } from './dto/update-transaksi-barang-keluar.dto';
import { PrismaService } from 'src/prisma.service';
import { timestampToISOString } from 'utils/time.util';

@Injectable()
export class TransaksiBarangKeluarService {
  constructor(private prisma: PrismaService) {}

  async create(createTransaksiBarangKeluarDto: CreateTransaksiBarangKeluarDto) {
    const { id, barang, hargaTotal, permintaanBarang_id, tanggal } =
      createTransaksiBarangKeluarDto;

    const mappedItems = barang.map((item) => ({
      barang_id: item.id,
      hargaSatuan: item.hargaSatuan,
      jumlah: item.jumlah,
    }));

    const transaksiBarangKeluar =
      await this.prisma.transaksiBarangKeluar.create({
        data: {
          id,
          tanggal,
          hargaTotal,
          permintaanBarang: {
            connect: {
              id: permintaanBarang_id,
            },
          },
          barang: {
            createMany: {
              data: mappedItems,
            },
          },
        },
      });

    return {
      data: transaksiBarangKeluar,
      message: 'Transaksi barang keluar telah ditambahkan',
    };
  }

  async findAll() {
    const transaksiBarangKeluar =
      await this.prisma.transaksiBarangKeluar.findMany({
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
          permintaanBarang: {
            select: {
              pelanggan: {
                select: {
                  nama: true,
                  telepon: true,
                  alamat: true,
                  email: true,
                },
              },
            },
          },
        },
      });

    const mappedTransaksiBarangKeluar = transaksiBarangKeluar.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { permintaanBarang, barang, ...others } = item;

      return {
        ...others,
        pelanggan: item.permintaanBarang.pelanggan,
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
      data: mappedTransaksiBarangKeluar,
      meta: {
        totalItems: transaksiBarangKeluar.length,
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

    const transaksiBarangKeluar =
      await this.prisma.transaksiBarangKeluar.findMany({
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
          permintaanBarang: {
            select: {
              pelanggan: {
                select: {
                  nama: true,
                  telepon: true,
                  alamat: true,
                  email: true,
                },
              },
            },
          },
        },
      });

    const mappedTransaksiBarangKeluar = transaksiBarangKeluar.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { permintaanBarang, barang, ...others } = item;

      return {
        ...others,
        pelanggan: item.permintaanBarang.pelanggan,
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
      data: mappedTransaksiBarangKeluar,
      meta: {
        totalItems: transaksiBarangKeluar.length,
      },
    };
  }

  findOne(id: string) {
    return `This action returns a #${id} transaksiBarangKeluar`;
  }

  update(
    id: string,
    updateTransaksiBarangKeluarDto: UpdateTransaksiBarangKeluarDto,
  ) {
    return `This action updates a #${id} transaksiBarangKeluar`;
  }

  remove(id: string) {
    return `This action removes a #${id} transaksiBarangKeluar`;
  }
}
