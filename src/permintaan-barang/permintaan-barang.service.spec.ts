import { Test, TestingModule } from '@nestjs/testing';
import { PermintaanBarangService } from './permintaan-barang.service';

describe('PermintaanBarangService', () => {
  let service: PermintaanBarangService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermintaanBarangService],
    }).compile();

    service = module.get<PermintaanBarangService>(PermintaanBarangService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
