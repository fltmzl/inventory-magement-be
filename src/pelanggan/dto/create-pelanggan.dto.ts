import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreatePelangganDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  nama: string;

  @IsNotEmpty()
  // @IsMobilePhone(
  //   'id-ID',
  //   { strictMode: false },
  //   {
  //     message: 'phone number must be indonesian format number',
  //   },
  // )
  @IsString()
  telepon: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  alamat: string;
}
