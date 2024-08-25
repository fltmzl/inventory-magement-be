import { Injectable } from '@nestjs/common';
import { CreatePermintaanBarangDto } from './dto/create-permintaan-barang.dto';
import { UpdatePermintaanBarangDto } from './dto/update-permintaan-barang.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PermintaanBarangService {
  constructor(private prisma: PrismaService) {}

  async create(createPermintaanBarangDto: CreatePermintaanBarangDto) {
    const { id, pegawai_id, pelanggan_id, barang, tanggal } =
      createPermintaanBarangDto;

    const mappedItems = barang.map((item) => ({
      barang_id: item.id,
      jumlah: item.jumlah,
    }));

    const permintaanBarang = await this.prisma.permintaanBarang.create({
      data: {
        id,
        tanggal,
        pegawai: {
          connect: {
            id: pegawai_id,
          },
        },
        pelanggan: {
          connect: {
            id: pelanggan_id,
          },
        },
        permintaanTerpenuhi: false,
        barang: {
          createMany: {
            data: mappedItems,
          },
        },
      },
    });

    return {
      data: permintaanBarang,
      message: 'Permintaan barang telah ditambahkan',
    };
  }

  async findAll() {
    const permintaanBarang = await this.prisma.permintaanBarang.findMany({
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
          },
        },
        pegawai: true,
        pelanggan: true,
      },
    });

    const mappedPermintaanBarang = permintaanBarang.map((item) => {
      return {
        ...item,
        barang: item.barang.map((barangItem) => ({
          id: barangItem.barang_id,
          nama: barangItem.barang.nama,
          satuan: barangItem.barang.satuan.nama,
          jumlah: barangItem.jumlah,
        })),
        pegawai: {
          namaLengkap: item.pegawai.namaLengkap,
          email: item.pegawai.email,
          telepon: item.pegawai.telepon,
          role: item.pegawai.role,
        },
        pelanggan: {
          nama: item.pelanggan.nama,
          telepon: item.pelanggan.telepon,
          alamat: item.pelanggan.alamat,
          email: item.pelanggan.email,
        },
      };
    });

    return {
      data: mappedPermintaanBarang,
      meta: {
        totalItems: permintaanBarang.length,
      },
    };
  }

  async findOne(id: string) {
    const permintaanBarang = await this.prisma.permintaanBarang.findFirst({
      where: {
        id,
      },
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
          },
        },
        pegawai: true,
        pelanggan: true,
      },
    });

    const mappedPermintaanBarang = {
      ...permintaanBarang,
      barang: permintaanBarang.barang.map((barangItem) => ({
        id: barangItem.barang_id,
        nama: barangItem.barang.nama,
        satuan: barangItem.barang.satuan.nama,
        jumlah: barangItem.jumlah,
      })),
      pegawai: {
        namaLengkap: permintaanBarang.pegawai.namaLengkap,
        email: permintaanBarang.pegawai.email,
        telepon: permintaanBarang.pegawai.telepon,
        role: permintaanBarang.pegawai.role,
      },
      pelanggan: {
        nama: permintaanBarang.pelanggan.nama,
        telepon: permintaanBarang.pelanggan.telepon,
        alamat: permintaanBarang.pelanggan.alamat,
        email: permintaanBarang.pelanggan.email,
      },
    };

    return {
      data: mappedPermintaanBarang,
    };
  }

  update(id: string, updatePermintaanBarangDto: UpdatePermintaanBarangDto) {
    return `This action updates a #${id} permintaanBarang`;
  }

  remove(id: string) {
    return `This action removes a #${id} permintaanBarang`;
  }
}
