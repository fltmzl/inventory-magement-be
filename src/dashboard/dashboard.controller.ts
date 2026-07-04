import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('low-supplies')
  getLowSupplies(@Query('maxStock', ParseIntPipe) maxStock: number = 5) {
    return this.dashboardService.getLowSupplies(maxStock);
  }

  @Get('best-selling')
  getBestSelling(@Query('limit', ParseIntPipe) limit: number = 10) {
    return this.dashboardService.getBestSelling(limit);
  }
}
