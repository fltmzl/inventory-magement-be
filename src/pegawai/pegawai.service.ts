import { Injectable } from '@nestjs/common';
import { CreatePegawaiDto } from './dto/create-pegawai.dto';
import { UpdatePegawaiDto } from './dto/update-pegawai.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/auth/mail.service';

@Injectable()
export class PegawaiService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async testMail() {
    this.mailService.sendEmail();
    return {
      text: 'coba email',
    };
  }

  async create(createPegawaiDto: CreatePegawaiDto) {
    const hashedPassword = await bcrypt.hash(createPegawaiDto.password, 10);

    const pegawai = await this.prisma.pegawai.create({
      data: {
        ...createPegawaiDto,
        password: hashedPassword,
      },
      select: {
        id: true,
      },
    });

    return {
      data: {
        id: pegawai.id,
      },
      message: 'Data pegawai telah ditambahkan',
    };
  }

  async findAll() {
    const pegawai = await this.prisma.pegawai.findMany();

    const mappedPegawai = pegawai.map((pegawaiItem) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...other } = pegawaiItem;
      return other;
    });

    return {
      data: mappedPegawai,
      meta: {
        totalItems: pegawai.length,
      },
    };
  }

  async findOne(id: string) {
    const pegawai = await this.prisma.pegawai.findUnique({
      where: { id },
    });

    return {
      data: pegawai,
    };
  }

  async findOneByEmail(email: string) {
    const pegawai = await this.prisma.pegawai.findFirst({
      where: { email },
    });

    return {
      data: pegawai,
    };
  }

  async update(id: string, updatePegawaiDto: UpdatePegawaiDto) {
    const pegawai = await this.prisma.pegawai.update({
      where: { id },
      data: updatePegawaiDto,
      select: {
        id: true,
      },
    });

    return {
      data: {
        id: pegawai.id,
      },
      message: 'Data pegawai telah diperbarui',
    };
  }

  async remove(id: string) {
    const pegawai = await this.prisma.pegawai.delete({
      where: { id },
      select: {
        id: true,
      },
    });

    return {
      data: {
        id: pegawai.id,
      },
      message: 'Data pegawai telah dihapus',
    };
  }
}
