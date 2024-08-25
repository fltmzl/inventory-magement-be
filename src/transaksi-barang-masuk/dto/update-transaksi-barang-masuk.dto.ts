import { PartialType } from '@nestjs/mapped-types';
import { CreateTransaksiBarangMasukDto } from './create-transaksi-barang-masuk.dto';

export class UpdateTransaksiBarangMasukDto extends PartialType(
  CreateTransaksiBarangMasukDto,
) {}
