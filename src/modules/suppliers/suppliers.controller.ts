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
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';
import { SuppliersService } from './suppliers.service';

@ApiTags('Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.WAREHOUSE_MANAGER)
  @ApiOperation({ summary: 'Create a supplier' })
  @ApiCreatedResponse({ description: 'Supplier created' })
  create(@Body() dto: CreateSupplierDto): Promise<Supplier> {
    return this.suppliersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all suppliers (paginated)' })
  @ApiOkResponse({ description: 'Paginated supplier list' })
  findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<Supplier>> {
    return this.suppliersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a supplier by ID' })
  @ApiOkResponse({ description: 'Supplier record' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Supplier> {
    return this.suppliersService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.WAREHOUSE_MANAGER)
  @ApiOperation({ summary: 'Update a supplier' })
  @ApiOkResponse({ description: 'Updated supplier' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierDto,
  ): Promise<Supplier> {
    return this.suppliersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN)
  @ApiOperation({ summary: 'Soft-delete a supplier' })
  @ApiNoContentResponse({ description: 'Deleted' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.suppliersService.remove(id);
  }
}
