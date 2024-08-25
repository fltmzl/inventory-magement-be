import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

class BarangDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsNotEmpty()
  hargaSatuan: number;

  @IsNumber()
  @IsNotEmpty()
  jumlah: number;
}

export class CreateTransaksiBarangKeluarDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  permintaanBarang_id: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BarangDto)
  barang: BarangDto[];

  @IsString()
  @IsNotEmpty()
  tanggal: string;

  @IsNumber()
  @IsNotEmpty()
  hargaTotal: number;
}
