import { Injectable } from '@nestjs/common';
import { CreatePelangganDto } from './dto/create-pelanggan.dto';
import { UpdatePelangganDto } from './dto/update-pelanggan.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PelangganService {
  constructor(private prisma: PrismaService) {}

  async create(createPelangganDto: CreatePelangganDto) {
    const pelanggan = await this.prisma.pelanggan.create({
      data: createPelangganDto,
      select: {
        id: true,
      },
    });

    return {
      data: {
        id: pelanggan.id,
      },
      message: 'Data pelanggan telah ditambahkan',
    };
  }

  async findAll() {
    const pelanggan = await this.prisma.pelanggan.findMany();

    return {
      data: pelanggan,
      meta: {
        totalItems: pelanggan.length,
      },
    };
  }

  async findOne(id: string) {
    const pelanggan = await this.prisma.pelanggan.findUnique({
      where: {
        id,
      },
    });

    return {
      data: pelanggan,
    };
  }

  async update(id: string, updatePelangganDto: UpdatePelangganDto) {
    const pelanggan = await this.prisma.pelanggan.update({
      where: { id },
      data: updatePelangganDto,
      select: {
        id: true,
      },
    });

    return {
      data: {
        id: pelanggan.id,
      },
      message: 'Data pelanggan telah diperbarui',
    };
  }

  async remove(id: string) {
    const pelanggan = await this.prisma.pelanggan.delete({
      where: { id },
      select: {
        id: true,
      },
    });

    return {
      data: {
        id: pelanggan.id,
      },
      message: 'Data pelanggan telah dihapus',
    };
  }
}
