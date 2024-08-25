import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBarangDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  nama: string;

  @IsNotEmpty()
  @IsString()
  kategori_id: string;

  @IsNotEmpty()
  @IsString()
  satuan_id: string;

  @IsNotEmpty()
  @IsNumber()
  stok: number;

  @IsNotEmpty()
  @IsNumber()
  harga: number;

  @IsNotEmpty()
  @IsString()
  pembelianTerakhir: string;
}
