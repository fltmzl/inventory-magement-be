import { Injectable } from '@nestjs/common';
import { CreateKategoriDto } from './dto/create-kategori.dto';
import { UpdateKategoriDto } from './dto/update-kategori.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class KategoriService {
  constructor(private prisma: PrismaService) {}

  async create(createKategoriDto: CreateKategoriDto) {
    const kategori = await this.prisma.kategori.create({
      data: createKategoriDto,
    });

    return {
      data: kategori,
      message: 'Kategori ditambahkan',
    };
  }

  async findAll() {
    const kategori = await this.prisma.kategori.findMany();

    return {
      data: kategori,
      meta: {
        totalItems: kategori.length,
      },
    };
  }

  async findOne(id: string) {
    const kategori = await this.prisma.kategori.findUnique({
      where: { id },
    });

    return {
      data: kategori,
    };
  }

  async update(id: string, updateKategoriDto: UpdateKategoriDto) {
    const kategori = await this.prisma.kategori.update({
      where: { id },
      data: updateKategoriDto,
    });

    return {
      data: kategori,
      message: 'Kategori diperbarui',
    };
  }

  async remove(id: string) {
    const kategori = await this.prisma.kategori.delete({
      where: { id },
    });

    return {
      data: kategori,
      message: `Kategori ${kategori.nama} dihapus`,
    };
  }
}
