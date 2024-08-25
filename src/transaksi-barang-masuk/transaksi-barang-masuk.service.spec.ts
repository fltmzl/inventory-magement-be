import { Test, TestingModule } from '@nestjs/testing';
import { TransaksiBarangMasukService } from './transaksi-barang-masuk.service';

describe('TransaksiBarangMasukService', () => {
  let service: TransaksiBarangMasukService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransaksiBarangMasukService],
    }).compile();

    service = module.get<TransaksiBarangMasukService>(TransaksiBarangMasukService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
