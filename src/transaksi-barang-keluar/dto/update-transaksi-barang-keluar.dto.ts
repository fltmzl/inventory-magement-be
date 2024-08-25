import { PartialType } from '@nestjs/mapped-types';
import { CreateTransaksiBarangKeluarDto } from './create-transaksi-barang-keluar.dto';

export class UpdateTransaksiBarangKeluarDto extends PartialType(
  CreateTransaksiBarangKeluarDto,
) {}
