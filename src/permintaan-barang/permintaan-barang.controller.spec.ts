import { Test, TestingModule } from '@nestjs/testing';
import { PermintaanBarangController } from './permintaan-barang.controller';
import { PermintaanBarangService } from './permintaan-barang.service';

describe('PermintaanBarangController', () => {
  let controller: PermintaanBarangController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermintaanBarangController],
      providers: [PermintaanBarangService],
    }).compile();

    controller = module.get<PermintaanBarangController>(PermintaanBarangController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
