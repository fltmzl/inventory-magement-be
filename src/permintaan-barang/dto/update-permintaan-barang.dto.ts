import { PartialType } from '@nestjs/mapped-types';
import { CreatePermintaanBarangDto } from './create-permintaan-barang.dto';

export class UpdatePermintaanBarangDto extends PartialType(CreatePermintaanBarangDto) {}
