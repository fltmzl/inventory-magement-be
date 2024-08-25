import { IsNotEmpty, IsString } from 'class-validator';

export class CreateKategoriDto {
  @IsNotEmpty()
  @IsString()
  kode: string;

  @IsNotEmpty()
  @IsString()
  nama: string;
}
