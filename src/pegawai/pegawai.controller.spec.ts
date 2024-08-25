import { Test, TestingModule } from '@nestjs/testing';
import { PegawaiController } from './pegawai.controller';
import { PegawaiService } from './pegawai.service';

describe('PegawaiController', () => {
  let controller: PegawaiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PegawaiController],
      providers: [PegawaiService],
    }).compile();

    controller = module.get<PegawaiController>(PegawaiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
