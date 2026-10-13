import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export enum AdjustmentType {
  KURANG = 'KURANG',
  TAMBAH = 'TAMBAH',
}

export class CreateStockAdjustmentDto {
  @IsNotEmpty({ message: 'barangId tidak boleh kosong' })
  @IsString({ message: 'barangId harus berupa string' })
  barangId: string;

  @IsNotEmpty({ message: 'jenis tidak boleh kosong' })
  @IsEnum(AdjustmentType, {
    message: 'jenis harus bernilai KURANG atau TAMBAH',
  })
  jenis: AdjustmentType;

  @IsNotEmpty({ message: 'jumlah tidak boleh kosong' })
  @IsNumber({}, { message: 'jumlah harus berupa angka' })
  @IsPositive({ message: 'jumlah harus berupa angka positif' })
  jumlah: number;

  @IsNotEmpty({ message: 'alasan tidak boleh kosong' })
  @IsString({ message: 'alasan harus berupa string' })
  alasan: string;

  @IsOptional()
  @IsString({ message: 'nomorLotId harus berupa string' })
  nomorLotId?: string;

  @IsOptional()
  @IsString({ message: 'tanggal harus berupa string format ISO/Date' })
  tanggal?: string;
}
