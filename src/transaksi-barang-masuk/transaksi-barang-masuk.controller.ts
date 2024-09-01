import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TransaksiBarangMasukService } from './transaksi-barang-masuk.service';
import { CreateTransaksiBarangMasukDto } from './dto/create-transaksi-barang-masuk.dto';
import { UpdateTransaksiBarangMasukDto } from './dto/update-transaksi-barang-masuk.dto';

@Controller('transaksi-barang-masuk')
export class TransaksiBarangMasukController {
  constructor(
    private readonly transaksiBarangMasukService: TransaksiBarangMasukService,
  ) {}

  @Post()
  create(@Body() createTransaksiBarangMasukDto: CreateTransaksiBarangMasukDto) {
    return this.transaksiBarangMasukService.create(
      createTransaksiBarangMasukDto,
    );
  }

  @Get()
  findAll() {
    return this.transaksiBarangMasukService.findAll();
  }

  @Get('report')
  getReport(@Query('from') dateFrom: string, @Query('to') dateTo: string) {
    return this.transaksiBarangMasukService.getReport(
      Number(dateFrom),
      Number(dateTo),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transaksiBarangMasukService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTransaksiBarangMasukDto: UpdateTransaksiBarangMasukDto,
  ) {
    return this.transaksiBarangMasukService.update(
      id,
      updateTransaksiBarangMasukDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transaksiBarangMasukService.remove(id);
  }
}
