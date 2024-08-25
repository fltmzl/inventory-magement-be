import { Injectable } from '@nestjs/common';
import { CreateSatuanDto } from './dto/create-satuan.dto';
import { UpdateSatuanDto } from './dto/update-satuan.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class SatuanService {
  constructor(private prisma: PrismaService) {}

  async create(createSatuanDto: CreateSatuanDto) {
    const satuan = await this.prisma.satuan.create({
      data: createSatuanDto,
    });

    return {
      data: satuan,
      message: 'Satuan ditambahkan',
    };
  }

  async findAll() {
    const satuan = await this.prisma.satuan.findMany();

    return {
      data: satuan,
      meta: {
        totalItems: satuan.length,
      },
    };
  }

  async findOne(id: string) {
    const satuan = await this.prisma.satuan.findUnique({
      where: { id },
    });

    return {
      data: satuan,
    };
  }

  async update(id: string, updateSatuanDto: UpdateSatuanDto) {
    const satuan = await this.prisma.satuan.update({
      where: { id },
      data: updateSatuanDto,
    });

    return {
      data: satuan,
      message: 'Satuan diperbarui',
    };
  }

  async remove(id: string) {
    const satuan = await this.prisma.satuan.delete({
      where: { id },
    });

    return {
      data: satuan,
      message: `Satuan ${satuan.nama} dihapus`,
    };
  }
}
