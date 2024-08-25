import { Module } from '@nestjs/common';
import { PegawaiService } from './pegawai.service';
import { PegawaiController } from './pegawai.controller';
import { PrismaService } from 'src/prisma.service';
import { MailService } from 'src/auth/mail.service';

@Module({
  controllers: [PegawaiController],
  providers: [PegawaiService, PrismaService, MailService],
  exports: [PegawaiService],
})
export class PegawaiModule {}
