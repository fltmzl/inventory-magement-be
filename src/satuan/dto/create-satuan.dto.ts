import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSatuanDto {
  @IsNotEmpty()
  @IsString()
  kode: string;

  @IsNotEmpty()
  @IsString()
  nama: string;
}
