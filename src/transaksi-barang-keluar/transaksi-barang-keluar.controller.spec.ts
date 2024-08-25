import { Test, TestingModule } from '@nestjs/testing';
import { TransaksiBarangKeluarController } from './transaksi-barang-keluar.controller';
import { TransaksiBarangKeluarService } from './transaksi-barang-keluar.service';

describe('TransaksiBarangKeluarController', () => {
  let controller: TransaksiBarangKeluarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransaksiBarangKeluarController],
      providers: [TransaksiBarangKeluarService],
    }).compile();

    controller = module.get<TransaksiBarangKeluarController>(TransaksiBarangKeluarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
