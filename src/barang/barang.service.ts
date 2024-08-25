import { Injectable } from '@nestjs/common';
import { CreateBarangDto } from './dto/create-barang.dto';
import { UpdateBarangDto } from './dto/update-barang.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class BarangService {
  constructor(private prisma: PrismaService) {}

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
