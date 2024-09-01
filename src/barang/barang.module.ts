import { Module } from '@nestjs/common';
import { BarangService } from './barang.service';
import { BarangController } from './barang.controller';
import { PrismaService } from 'src/prisma.service';
import { MailService } from 'src/auth/mail.service';

@Module({
  controllers: [BarangController],
  providers: [BarangService, PrismaService, MailService],
})
export class BarangModule {}
