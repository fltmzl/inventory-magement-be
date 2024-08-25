import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TransaksiBarangKeluarService } from './transaksi-barang-keluar.service';
import { CreateTransaksiBarangKeluarDto } from './dto/create-transaksi-barang-keluar.dto';
import { UpdateTransaksiBarangKeluarDto } from './dto/update-transaksi-barang-keluar.dto';

@Controller('transaksi-barang-keluar')
export class TransaksiBarangKeluarController {
  constructor(
    private readonly transaksiBarangKeluarService: TransaksiBarangKeluarService,
  ) {}

  @Post()
  create(
    @Body() createTransaksiBarangKeluarDto: CreateTransaksiBarangKeluarDto,
  ) {
    return this.transaksiBarangKeluarService.create(
      createTransaksiBarangKeluarDto,
    );
  }

  @Get()
  findAll() {
    return this.transaksiBarangKeluarService.findAll();
  }

  @Get('report')
  getReport(@Query('from') dateFrom: string, @Query('to') dateTo: string) {
    return this.transaksiBarangKeluarService.getReport(
      Number(dateFrom),
      Number(dateTo),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transaksiBarangKeluarService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransaksiBarangKeluarDto: UpdateTransaksiBarangKeluarDto,
  ) {
    return this.transaksiBarangKeluarService.update(
      id,
      updateTransaksiBarangKeluarDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transaksiBarangKeluarService.remove(id);
  }
}
