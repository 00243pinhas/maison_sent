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
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.WAREHOUSE_MANAGER)
  @ApiOperation({ summary: 'Create a product' })
  @ApiCreatedResponse({ description: 'Product created' })
  create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List products with optional filters (paginated)' })
  @ApiOkResponse({ description: 'Paginated product list' })
  findAll(@Query() query: ProductQueryDto): Promise<PaginatedResponse<Product>> {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiOkResponse({ description: 'Product record' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.WAREHOUSE_MANAGER)
  @ApiOperation({ summary: 'Update a product' })
  @ApiOkResponse({ description: 'Updated product' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(RoleName.SUPER_ADMIN, RoleName.ADMIN, RoleName.WAREHOUSE_MANAGER)
  @ApiOperation({ summary: 'Soft-delete a product' })
  @ApiNoContentResponse({ description: 'Deleted' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
