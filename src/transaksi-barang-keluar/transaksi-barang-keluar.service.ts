/* eslint-disable @typescript-eslint/no-unused-vars */
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

    const result = await this.prisma.$transaction(async (tx) => {
      const detailsToInsert = [];

      for (const item of barang) {
        // Find master Barang to verify stock and retrieve unit price
        const barangMaster = await tx.barang.findUnique({
          where: { id: item.id },
        });

        if (!barangMaster) {
          throw new Error(`Barang dengan ID ${item.id} tidak ditemukan.`);
        }

        if (barangMaster.stok < item.jumlah) {
          throw new Error(
            `Stok barang "${barangMaster.nama}" tidak mencukupi. Dibutuhkan: ${item.jumlah}, Tersedia: ${barangMaster.stok}`,
          );
        }

        // Query DetailNomorLotBarang joined with NomorLot ordered by oldest first (FIFO)
        const lots = await tx.detailNomorLotBarang.findMany({
          where: {
            barang_id: item.id,
            totalBarang: {
              gt: 0,
            },
          },
          include: {
            nomorLot: true,
          },
          orderBy: {
            nomorLot: {
              createdAt: 'asc',
            },
          },
        });

        let remainingQty = item.jumlah;

        for (const lot of lots) {
          if (remainingQty <= 0) break;

          const lotStock = lot.totalBarang || 0;
          const deductQty = Math.min(remainingQty, lotStock);

          // Deduct from the lot
          await tx.detailNomorLotBarang.update({
            where: {
              nomorLot_id_barang_id: {
                nomorLot_id: lot.nomorLot_id,
                barang_id: item.id,
              },
            },
            data: {
              totalBarang: lotStock - deductQty,
            },
          });

          // Record detail for insertion
          detailsToInsert.push({
            transaksiBarangKeluar_id: id,
            barang_id: item.id,
            nomorLot_id: lot.nomorLot_id,
            jumlah: deductQty,
            hargaSatuan: barangMaster.harga,
          });

          remainingQty -= deductQty;
        }

        if (remainingQty > 0) {
          throw new Error(
            `Stok Lot untuk barang "${barangMaster.nama}" tidak mencukupi untuk memenuhi permintaan. Kurang: ${remainingQty}`,
          );
        }

        // Decrement overall product stock in master Barang
        await tx.barang.update({
          where: { id: item.id },
          data: {
            stok: {
              decrement: item.jumlah,
            },
          },
        });
      }

      // Create outgoing transaction header and bulk insert details
      const transaksiBarangKeluar = await tx.transaksiBarangKeluar.create({
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
              data: detailsToInsert,
            },
          },
        },
      });

      // Update status on PermintaanBarang
      await tx.permintaanBarang.update({
        where: {
          id: permintaanBarang_id,
        },
        data: {
          permintaanTerpenuhi: true,
        },
      });

      return transaksiBarangKeluar;
    });

    return {
      data: result,
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
              nomorLot: {
                select: {
                  kode: true,
                  createdAt: true,
                },
              },
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
        orderBy: {
          createdAt: 'desc',
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
            nomorLot: [
              {
                kode: barangItem.nomorLot.kode,
                totalBarang: barangItem.jumlah,
                createdAt: barangItem.nomorLot.createdAt,
              },
            ],
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
    const transaksiBarangKeluar =
      await this.prisma.transaksiBarangKeluar.findMany({
        where: {
          tanggal: {
            gte: dateFrom
              ? timestampToISOString(dateFrom)
              : timestampToISOString(1),
            lte: dateTo
              ? timestampToISOString(dateTo)
              : timestampToISOString(new Date().getTime()),
          },
        },
        include: {
          barang: {
            select: {
              barang_id: true,
              jumlah: true,
              hargaSatuan: true,
              nomorLot: {
                select: {
                  kode: true,
                  createdAt: true,
                },
              },
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
            nomorLot: [
              {
                kode: barangItem.nomorLot.kode,
                totalBarang: barangItem.jumlah,
                createdAt: barangItem.nomorLot.createdAt,
              },
            ],
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

  async findOne(id: string) {
    const transaksiBarangKeluar =
      await this.prisma.transaksiBarangKeluar.findUnique({
        where: { id },
      });

    return transaksiBarangKeluar;
  }

  update(
    id: string,
    updateTransaksiBarangKeluarDto: UpdateTransaksiBarangKeluarDto,
  ) {
    return `This action updates a #${id} transaksiBarangKeluar`;
  }

  async remove(id: string) {
    const detailTransaksiBarangKeluar =
      await this.prisma.detailTransaksiBarangKeluar.deleteMany({
        where: {
          transaksiBarangKeluar_id: id,
        },
      });

    const transaksiBarangKeluar =
      await this.prisma.transaksiBarangKeluar.delete({
        where: { id },
      });

    return {
      data: transaksiBarangKeluar,
      message: 'Transaksi barang keluar berhasil dihapus',
    };
  }

  async getBestSellingItems(limit: number) {
    // const bestSellingItems =
    //   await this.prisma.detailTransaksiBarangKeluar.groupBy({
    //     by: ['barang_id'],
    //     _sum: {
    //       jumlah: true,
    //     },
    //     // include: {
    //     //   barang: {
    //     //     select: {
    //     //       nama: true,
    //     //     },
    //     //   },
    //     // },
    //     // orderBy: {
    //     //   _sum: {
    //     //     jumlah: 'desc',
    //     //   },
    //     // },
    //   });

    const bestSellingItems: { id: string; nama: string; total: string }[] =
      await this.prisma.$queryRaw`
      SELECT 
        b.id,
        b.nama, 
        SUM(dtbk.jumlah) AS total 
      FROM "Barang" b
      JOIN "DetailTransaksiBarangKeluar" dtbk ON b.id = dtbk.barang_id
      GROUP BY id
      ORDER BY total DESC
      LIMIT ${limit}`;

    const result = bestSellingItems.map((item) => ({
      ...item,
      total: Number(item.total), // Convert BigInt to Number
    }));

    return {
      data: result,
    };
  }
}
