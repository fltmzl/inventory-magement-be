import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { SatuanService } from './satuan.service';
import { CreateSatuanDto } from './dto/create-satuan.dto';
import { UpdateSatuanDto } from './dto/update-satuan.dto';

@Controller('satuan')
export class SatuanController {
  constructor(private readonly satuanService: SatuanService) {}

  @Post()
  create(@Body() createSatuanDto: CreateSatuanDto) {
    return this.satuanService.create(createSatuanDto);
  }

  @Get()
  findAll() {
    return this.satuanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.satuanService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateSatuanDto: UpdateSatuanDto) {
    return this.satuanService.update(id, updateSatuanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.satuanService.remove(id);
  }
}
