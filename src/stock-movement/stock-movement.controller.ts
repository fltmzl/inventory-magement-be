import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { StockMovementService } from './stock-movement.service';
import { MovementType } from '@prisma/client';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';

@Controller('stock-movement')
export class StockMovementController {
  constructor(private readonly stockMovementService: StockMovementService) {}

  @Post('adjustment')
  createAdjustment(@Body() createAdjustmentDto: CreateStockAdjustmentDto) {
    return this.stockMovementService.createAdjustment(createAdjustmentDto);
  }

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

  @Get('weekly-summary')
  getWeeklySummary(
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('barangId') barangId?: string,
  ) {
    return this.stockMovementService.getWeeklySummary({
      month,
      year,
      from,
      to,
      barangId,
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
