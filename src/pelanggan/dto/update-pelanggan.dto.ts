import { PartialType } from '@nestjs/mapped-types';
import { CreatePelangganDto } from './create-pelanggan.dto';

export class UpdatePelangganDto extends PartialType(CreatePelangganDto) {}
