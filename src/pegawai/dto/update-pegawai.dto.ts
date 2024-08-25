import { PartialType } from '@nestjs/mapped-types';
import { CreatePegawaiDto } from './create-pegawai.dto';

export class UpdatePegawaiDto extends PartialType(CreatePegawaiDto) {}
