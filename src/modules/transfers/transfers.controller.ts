import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreateTransferItemDto } from './dto/create-transfer-item.dto';
import { RejectTransferDto } from './dto/reject-transfer.dto';
import { TransferQueryDto } from './dto/transfer-query.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { UpdateTransferItemDto } from './dto/update-transfer-item.dto';
import { Transfer } from './entities/transfer.entity';
import { TransfersService } from './transfers.service';

@ApiTags('Transfers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transfers')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  @Post()
  @Roles(
    RoleName.SUPER_ADMIN,
    RoleName.ADMIN,
    RoleName.WAREHOUSE_MANAGER,
    RoleName.BRANCH_MANAGER,
  )
  @ApiOperation({ summary: 'Create a new transfer draft' })
  @ApiCreatedResponse({ description: 'Created transfer' })
  create(
    @Body() dto: CreateTransferDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Transfer> {
    return this.transfersService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'List transfers with optional filters (paginated, newest first)',
  })
  @ApiOkResponse({ description: 'Paginated transfer list' })
  findAll(
    @Query() query: TransferQueryDto,
  ): Promise<PaginatedResponse<Transfer>> {
    return this.transfersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transfer by ID' })
  @ApiOkResponse({ description: 'Transfer with all items and relations' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Transfer> {
    return this.transfersService.findById(id);
  }

  @Patch(':id')
  @Roles(
    RoleName.SUPER_ADMIN,
    RoleName.ADMIN,
    RoleName.WAREHOUSE_MANAGER,
    RoleName.BRANCH_MANAGER,
  )
  @ApiOperation({
    summary: 'Update a DRAFT transfer header (referenceNumber, notes only)',
  })
  @ApiOkResponse({ description: 'Updated transfer' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransferDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Transfer> {
    return this.transfersService.update(id, dto, user.id, user.role);
  }

  @Post(':id/items')
  @Roles(
    RoleName.SUPER_ADMIN,
    RoleName.ADMIN,
    RoleName.WAREHOUSE_MANAGER,
    RoleName.BRANCH_MANAGER,
  )
  @ApiOperation({ summary: 'Add an item to a DRAFT transfer' })
  @ApiCreatedResponse({ description: 'Transfer with the new item appended' })
  addItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTransferItemDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Transfer> {
    return this.transfersService.addItem(id, dto, user.id, user.role);
  }

  @Patch(':id/items/:itemId')
  @Roles(
    RoleName.SUPER_ADMIN,
    RoleName.ADMIN,
    RoleName.WAREHOUSE_MANAGER,
    RoleName.BRANCH_MANAGER,
  )
  @ApiOperation({ summary: 'Update an item quantity in a DRAFT transfer' })
  @ApiOkResponse({ description: 'Updated transfer' })
  updateItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateTransferItemDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Transfer> {
    return this.transfersService.updateItem(
      id,
      itemId,
      dto,
      user.id,
      user.role,
    );
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.OK)
  @Roles(
    RoleName.SUPER_ADMIN,
    RoleName.ADMIN,
    RoleName.WAREHOUSE_MANAGER,
    RoleName.BRANCH_MANAGER,
  )
  @ApiOperation({ summary: 'Remove an item from a DRAFT transfer' })
  @ApiOkResponse({ description: 'Transfer without the removed item' })
  removeItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Transfer> {
    return this.transfersService.removeItem(id, itemId, user.id, user.role);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @Roles(
    RoleName.SUPER_ADMIN,
    RoleName.ADMIN,
    RoleName.WAREHOUSE_MANAGER,
    RoleName.BRANCH_MANAGER,
  )
  @ApiOperation({
    summary: 'Submit a DRAFT transfer for approval → PENDING_APPROVAL',
  })
  @ApiOkResponse({ description: 'Transfer now in PENDING_APPROVAL' })
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Transfer> {
    return this.transfersService.submit(id, user.id, user.role);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({
    summary:
      'Approve a PENDING_APPROVAL transfer (locks + checks stock) → APPROVED',
  })
  @ApiOkResponse({ description: 'Transfer now in APPROVED' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Transfer> {
    return this.transfersService.approve(id, user.id);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({
    summary: 'Reject a PENDING_APPROVAL transfer with a reason → REJECTED',
  })
  @ApiOkResponse({ description: 'Transfer now in REJECTED' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectTransferDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Transfer> {
    return this.transfersService.reject(id, user.id, dto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @Roles(
    RoleName.SUPER_ADMIN,
    RoleName.ADMIN,
    RoleName.WAREHOUSE_MANAGER,
    RoleName.BRANCH_MANAGER,
  )
  @ApiOperation({
    summary: 'Cancel a DRAFT or PENDING_APPROVAL transfer → CANCELLED',
  })
  @ApiOkResponse({ description: 'Transfer now in CANCELLED' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Transfer> {
    return this.transfersService.cancel(id, user.id, user.role);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.WAREHOUSE_MANAGER)
  @ApiOperation({
    summary:
      'Complete an APPROVED transfer — writes inventory movements and updates balances → COMPLETED',
  })
  @ApiOkResponse({
    description: 'Transfer now in COMPLETED, inventory updated',
  })
  complete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Transfer> {
    return this.transfersService.complete(id, user.id);
  }
}
