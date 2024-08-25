import { Test, TestingModule } from '@nestjs/testing';
import { TransaksiBarangKeluarService } from './transaksi-barang-keluar.service';

describe('TransaksiBarangKeluarService', () => {
  let service: TransaksiBarangKeluarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransaksiBarangKeluarService],
    }).compile();

    service = module.get<TransaksiBarangKeluarService>(TransaksiBarangKeluarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
