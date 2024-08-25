import { Module } from '@nestjs/common';
import { SatuanService } from './satuan.service';
import { SatuanController } from './satuan.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [SatuanController],
  providers: [SatuanService, PrismaService],
})
export class SatuanModule {}
