import { Test, TestingModule } from '@nestjs/testing';
import { SatuanController } from './satuan.controller';
import { SatuanService } from './satuan.service';

describe('SatuanController', () => {
  let controller: SatuanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SatuanController],
      providers: [SatuanService],
    }).compile();

    controller = module.get<SatuanController>(SatuanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
