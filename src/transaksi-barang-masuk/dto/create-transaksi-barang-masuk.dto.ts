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

export class CreateTransaksiBarangMasukDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  nomorLot: string;

  @IsString()
  @IsNotEmpty()
  tanggal: string;

  @IsNumber()
  @IsNotEmpty()
  hargaTotal: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BarangDto)
  barang: BarangDto[];
}
