import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class ReceiveStockDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  productId: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  toLocationId: string;

  @ApiProperty({ type: Number, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  referenceNumber?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
