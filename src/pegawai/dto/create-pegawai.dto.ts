import { IsNotEmpty, IsString, IsEmail, IsEnum } from 'class-validator';

enum Role {
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
}

export class CreatePegawaiDto {
  @IsNotEmpty()
  @IsString()
  namaLengkap: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  foto: string;

  @IsNotEmpty()
  @IsString()
  telepon: string;

  @IsNotEmpty()
  @IsString()
  alamat: string;

  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
