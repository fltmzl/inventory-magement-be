import { Test, TestingModule } from '@nestjs/testing';
import { SatuanService } from './satuan.service';

describe('SatuanService', () => {
  let service: SatuanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SatuanService],
    }).compile();

    service = module.get<SatuanService>(SatuanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
