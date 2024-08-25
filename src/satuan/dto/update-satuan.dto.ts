import { PartialType } from '@nestjs/mapped-types';
import { CreateSatuanDto } from './create-satuan.dto';

export class UpdateSatuanDto extends PartialType(CreateSatuanDto) {}
