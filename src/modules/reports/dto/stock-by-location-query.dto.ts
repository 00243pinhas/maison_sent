import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class StockByLocationQueryDto {
  @ApiPropertyOptional({ description: 'Filter to a specific location UUID' })
  @IsOptional()
  @IsUUID()
  locationId?: string;
}
