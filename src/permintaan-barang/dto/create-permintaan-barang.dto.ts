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
  jumlah: number;
}

export class CreatePermintaanBarangDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  pelanggan_id: string;

  @IsString()
  @IsNotEmpty()
  pegawai_id: string;

  @IsString()
  @IsNotEmpty()
  tanggal: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BarangDto)
  barang: BarangDto[];
}
