import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { RoleName } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { BalanceQueryDto } from './dto/balance-query.dto';
import { LowStockQueryDto } from './dto/low-stock-query.dto';
import { MovementQueryDto } from './dto/movement-query.dto';
import { RecordDamageDto } from './dto/record-damage.dto';
import { RecordReturnDto } from './dto/record-return.dto';
import { RecordSaleDto } from './dto/record-sale.dto';
import { ReceiveStockDto } from './dto/receive-stock.dto';
import { InventoryBalance } from './entities/inventory-balance.entity';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { InventoryBalancesService } from './inventory-balances.service';
import { InventoryMovementsService } from './inventory-movements.service';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly inventoryMovementsService: InventoryMovementsService,
    private readonly inventoryBalancesService: InventoryBalancesService,
  ) {}

  // ── Mutations ──────────────────────────────────────────────────────────────

  @Post('receive')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.WAREHOUSE_MANAGER)
  @ApiOperation({ summary: 'Receive stock into a location (RECEIVED movement)' })
  @ApiCreatedResponse({ description: 'Movement record' })
  receiveStock(
    @Body() dto: ReceiveStockDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InventoryMovement> {
    return this.inventoryService.receiveStock(dto, user.id);
  }

  @Post('sales')
  @Roles(
    RoleName.SUPER_ADMIN,
    RoleName.ADMIN,
    RoleName.BRANCH_MANAGER,
    RoleName.SALES_STAFF,
  )
  @ApiOperation({ summary: 'Record a sale (SALE movement, decreases stock)' })
  @ApiCreatedResponse({ description: 'Movement record' })
  recordSale(
    @Body() dto: RecordSaleDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InventoryMovement> {
    return this.inventoryService.recordSale(dto, user.id);
  }

  @Post('returns')
  @Roles(
    RoleName.SUPER_ADMIN,
    RoleName.ADMIN,
    RoleName.BRANCH_MANAGER,
    RoleName.WAREHOUSE_MANAGER,
    RoleName.SALES_STAFF,
  )
  @ApiOperation({ summary: 'Record a customer return (RETURN movement, increases stock)' })
  @ApiCreatedResponse({ description: 'Movement record' })
  recordReturn(
    @Body() dto: RecordReturnDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InventoryMovement> {
    return this.inventoryService.recordReturn(dto, user.id);
  }

  @Post('damage')
  @Roles(
    RoleName.SUPER_ADMIN,
    RoleName.ADMIN,
    RoleName.BRANCH_MANAGER,
    RoleName.WAREHOUSE_MANAGER,
  )
  @ApiOperation({ summary: 'Record damaged/written-off stock (DAMAGE movement)' })
  @ApiCreatedResponse({ description: 'Movement record' })
  recordDamage(
    @Body() dto: RecordDamageDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InventoryMovement> {
    return this.inventoryService.recordDamage(dto, user.id);
  }

  @Post('adjust')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'Adjust stock up or down with a mandatory reference (ADJUSTMENT_IN / ADJUSTMENT_OUT)' })
  @ApiCreatedResponse({ description: 'Movement record' })
  adjustStock(
    @Body() dto: AdjustStockDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InventoryMovement> {
    return this.inventoryService.adjustStock(dto, user.id);
  }

  // ── Movement history reads ─────────────────────────────────────────────────

  @Get('movements')
  @ApiOperation({ summary: 'List movement history with optional filters (paginated, newest first)' })
  @ApiOkResponse({ description: 'Paginated movement list' })
  findAllMovements(
    @Query() query: MovementQueryDto,
  ): Promise<PaginatedResponse<InventoryMovement>> {
    return this.inventoryMovementsService.findAll(query);
  }

  @Get('movements/:id')
  @ApiOperation({ summary: 'Get a single movement by ID' })
  @ApiOkResponse({ description: 'Movement record' })
  findOneMovement(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InventoryMovement> {
    return this.inventoryMovementsService.findById(id);
  }

  // ── Balance reads ──────────────────────────────────────────────────────────

  @Get('balances')
  @ApiOperation({ summary: 'List current stock balances with optional filters (paginated)' })
  @ApiOkResponse({ description: 'Paginated balance list' })
  findAllBalances(
    @Query() query: BalanceQueryDto,
  ): Promise<PaginatedResponse<InventoryBalance>> {
    return this.inventoryBalancesService.findAll(query);
  }

  @Get('balances/low-stock')
  @ApiOperation({ summary: 'List balances below the given quantity threshold' })
  @ApiOkResponse({ description: 'Paginated low-stock balance list' })
  findLowStock(
    @Query() query: LowStockQueryDto,
  ): Promise<PaginatedResponse<InventoryBalance>> {
    return this.inventoryBalancesService.findLowStock(query);
  }

  @Post('balances/reconcile')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN)
  @ApiOperation({ summary: 'SUPER_ADMIN: truncate and rebuild inventory_balances from movement history' })
  @ApiOkResponse({ description: 'Reconciliation result' })
  reconcileBalances(): Promise<{
    replayedMovements: number;
    rebuiltBalances: number;
    durationMs: number;
  }> {
    return this.inventoryService.reconcileBalances();
  }
}
