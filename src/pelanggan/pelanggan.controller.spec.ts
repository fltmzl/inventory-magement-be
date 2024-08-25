import { Test, TestingModule } from '@nestjs/testing';
import { PelangganController } from './pelanggan.controller';
import { PelangganService } from './pelanggan.service';

describe('PelangganController', () => {
  let controller: PelangganController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PelangganController],
      providers: [PelangganService],
    }).compile();

    controller = module.get<PelangganController>(PelangganController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
