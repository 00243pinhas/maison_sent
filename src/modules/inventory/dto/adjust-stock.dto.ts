import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export enum AdjustDirection {
  INCREASE = 'INCREASE',
  DECREASE = 'DECREASE',
}

export class AdjustStockDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  productId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  locationId: string;

  @ApiProperty({ enum: AdjustDirection })
  @IsEnum(AdjustDirection)
  direction: AdjustDirection;

  @ApiProperty({ type: Number, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ maxLength: 80, description: 'Required audit reference for adjustments' })
  @IsString()
  @MaxLength(80)
  referenceNumber: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
