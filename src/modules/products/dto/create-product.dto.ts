import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ProductStatus } from '../../../common/enums/product-status.enum';

export class CreateProductDto {
  @ApiProperty({ maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ maxLength: 150 })
  @IsString()
  @MaxLength(150)
  brand: string;

  @ApiProperty({ maxLength: 64 })
  @IsString()
  @MaxLength(64)
  sku: string;

  @ApiPropertyOptional({ maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  barcode?: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  categoryId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  supplierId: string;

  @ApiProperty({ type: Number, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPrice: number;

  @ApiProperty({ type: Number, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  sellingPrice: number;

  @ApiProperty({
    type: Number,
    minimum: 1,
    description: 'Volume in millilitres',
  })
  @IsInt()
  @Min(1)
  sizeMl: number;

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({
    type: Number,
    minimum: 1,
    description:
      'Trigger low-stock alert when balance drops to this level. Null = disabled.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  lowStockThreshold?: number;
}
