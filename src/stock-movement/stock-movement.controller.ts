import { Controller, Get, Param, Query } from '@nestjs/common';
import { StockMovementService } from './stock-movement.service';
import { MovementType } from '@prisma/client';

@Controller('stock-movement')
export class StockMovementController {
  constructor(private readonly stockMovementService: StockMovementService) {}

  @Get()
  findAll(
    @Query('from') dateFrom?: string,
    @Query('to') dateTo?: string,
    @Query('tipe') tipe?: MovementType,
    @Query('barangId') barangId?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    return this.stockMovementService.findAll({
      dateFrom,
      dateTo,
      tipe,
      barangId,
      search,
      limit,
      page,
    });
  }

  @Get('summary')
  getSummary(@Query('from') dateFrom?: string, @Query('to') dateTo?: string) {
    return this.stockMovementService.getSummary({
      dateFrom,
      dateTo,
    });
  }

  @Get('report')
  getReport(
    @Query('from') dateFrom?: string,
    @Query('to') dateTo?: string,
    @Query('tipe') tipe?: MovementType,
    @Query('barangId') barangId?: string,
  ) {
    return this.stockMovementService.getReport({
      dateFrom,
      dateTo,
      tipe,
      barangId,
    });
  }

  @Get('barang/:barangId')
  findByBarang(
    @Param('barangId') barangId: string,
    @Query('from') dateFrom?: string,
    @Query('to') dateTo?: string,
  ) {
    return this.stockMovementService.findByBarang(barangId, {
      dateFrom,
      dateTo,
    });
  }
}
