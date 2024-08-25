import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { PermintaanBarangService } from './permintaan-barang.service';
import { CreatePermintaanBarangDto } from './dto/create-permintaan-barang.dto';
import { UpdatePermintaanBarangDto } from './dto/update-permintaan-barang.dto';

@Controller('permintaan-barang')
export class PermintaanBarangController {
  constructor(
    private readonly permintaanBarangService: PermintaanBarangService,
  ) {}

  @Post()
  create(@Body() createPermintaanBarangDto: CreatePermintaanBarangDto) {
    return this.permintaanBarangService.create(createPermintaanBarangDto);
  }

  @Get()
  findAll() {
    return this.permintaanBarangService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permintaanBarangService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermintaanBarangDto: UpdatePermintaanBarangDto,
  ) {
    return this.permintaanBarangService.update(id, updatePermintaanBarangDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permintaanBarangService.remove(id);
  }
}
