import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuditQueryDto } from './dto/audit-query.dto';
import { DateRangeQueryDto } from './dto/date-range-query.dto';
import { DeadStockQueryDto } from './dto/dead-stock-query.dto';
import { SalesByPeriodQueryDto } from './dto/sales-by-period-query.dto';
import { StockByLocationQueryDto } from './dto/stock-by-location-query.dto';
import { TopNQueryDto } from './dto/top-n-query.dto';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('stock-summary')
  @Roles(
    RoleName.SUPER_ADMIN,
    RoleName.ADMIN,
    RoleName.WAREHOUSE_MANAGER,
    RoleName.BRANCH_MANAGER,
  )
  @ApiOperation({
    summary: 'Total quantity and value per product across all locations',
  })
  stockSummary() {
    return this.reportsService.stockSummary();
  }

  @Get('stock-by-location')
  @Roles(
    RoleName.SUPER_ADMIN,
    RoleName.ADMIN,
    RoleName.WAREHOUSE_MANAGER,
    RoleName.BRANCH_MANAGER,
  )
  @ApiOperation({ summary: 'Quantity and value per product per location' })
  stockByLocation(@Query() query: StockByLocationQueryDto) {
    return this.reportsService.stockByLocation(query);
  }

  @Get('inventory-value')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({
    summary: 'Total inventory value aggregated across all locations',
  })
  inventoryValue() {
    return this.reportsService.inventoryValue();
  }

  @Get('low-stock')
  @Roles(
    RoleName.SUPER_ADMIN,
    RoleName.ADMIN,
    RoleName.WAREHOUSE_MANAGER,
    RoleName.BRANCH_MANAGER,
  )
  @ApiOperation({ summary: 'Products at or below a given quantity threshold' })
  @ApiQuery({ name: 'minQuantity', required: false, type: Number, example: 10 })
  lowStock(@Query('minQuantity') minQuantity = '10') {
    return this.reportsService.lowStock(parseInt(minQuantity, 10));
  }

  @Get('dead-stock')
  @Roles(
    RoleName.SUPER_ADMIN,
    RoleName.ADMIN,
    RoleName.WAREHOUSE_MANAGER,
    RoleName.BRANCH_MANAGER,
  )
  @ApiOperation({
    summary: 'Products with no outbound movement in the last N days',
  })
  deadStock(@Query() query: DeadStockQueryDto) {
    return this.reportsService.deadStock(query);
  }

  @Get('fast-movers')
  @Roles(
    RoleName.SUPER_ADMIN,
    RoleName.ADMIN,
    RoleName.WAREHOUSE_MANAGER,
    RoleName.BRANCH_MANAGER,
  )
  @ApiOperation({ summary: 'Top N products by units sold in a period' })
  fastMovers(@Query() query: TopNQueryDto) {
    return this.reportsService.fastMovers(query);
  }

  @Get('sales-by-period')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.BRANCH_MANAGER)
  @ApiOperation({
    summary:
      'Sale movements aggregated by day, week, or month with snapshotted prices',
  })
  salesByPeriod(@Query() query: SalesByPeriodQueryDto) {
    return this.reportsService.salesByPeriod(query);
  }

  @Get('revenue-summary')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({
    summary:
      'Total revenue, COGS, and purchase cost in a period using snapshotted prices',
  })
  revenueSummary(@Query() query: DateRangeQueryDto) {
    return this.reportsService.revenueSummary(query);
  }

  @Get('branch-performance')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({
    summary: 'Sales revenue and units sold per location (admin only)',
  })
  branchPerformance(@Query() query: DateRangeQueryDto) {
    return this.reportsService.branchPerformance(query);
  }

  @Get('movement-audit')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.WAREHOUSE_MANAGER)
  @ApiOperation({
    summary: 'Detailed movement log with filters (max 500 rows)',
  })
  movementAudit(@Query() query: AuditQueryDto) {
    return this.reportsService.movementAudit(query);
  }

  @Get('movement-summary')
  @Roles(
    RoleName.SUPER_ADMIN,
    RoleName.ADMIN,
    RoleName.WAREHOUSE_MANAGER,
    RoleName.BRANCH_MANAGER,
  )
  @ApiOperation({
    summary: 'Transaction count and quantity grouped by movement type',
  })
  movementSummary(@Query() query: DateRangeQueryDto) {
    return this.reportsService.movementSummary(query);
  }

  @Get('transfer-report')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.WAREHOUSE_MANAGER)
  @ApiOperation({
    summary: 'Completed transfers grouped by source and destination',
  })
  transferReport(@Query() query: DateRangeQueryDto) {
    return this.reportsService.transferReport(query);
  }
}
