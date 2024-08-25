import { Test, TestingModule } from '@nestjs/testing';
import { TransaksiBarangMasukController } from './transaksi-barang-masuk.controller';
import { TransaksiBarangMasukService } from './transaksi-barang-masuk.service';

describe('TransaksiBarangMasukController', () => {
  let controller: TransaksiBarangMasukController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransaksiBarangMasukController],
      providers: [TransaksiBarangMasukService],
    }).compile();

    controller = module.get<TransaksiBarangMasukController>(TransaksiBarangMasukController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
