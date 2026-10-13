import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('weekly-summary')
  getWeeklySummary(
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('barangId') barangId?: string,
  ) {
    return this.dashboardService.getWeeklySummary({
      month,
      year,
      from,
      to,
      barangId,
    });
  }

  @Get('low-supplies')
  getLowSupplies(@Query('maxStock', ParseIntPipe) maxStock: number = 5) {
    return this.dashboardService.getLowSupplies(maxStock);
  }

  @Get('best-selling')
  getBestSelling(@Query('limit', ParseIntPipe) limit: number = 10) {
    return this.dashboardService.getBestSelling(limit);
  }

  @Get('transaction-trend')
  getTransactionTrend(@Query('days') days?: string) {
    const daysCount = days ? parseInt(days, 10) : 30;
    return this.dashboardService.getTransactionTrend(
      isNaN(daysCount) ? 30 : daysCount,
    );
  }

  @Get('recent-activities')
  getRecentActivities() {
    return this.dashboardService.getRecentActivities();
  }

  @Get('category-distribution')
  getCategoryDistribution() {
    return this.dashboardService.getCategoryDistribution();
  }
}
