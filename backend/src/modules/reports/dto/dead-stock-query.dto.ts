import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class DeadStockQueryDto {
  @ApiPropertyOptional({
    description:
      'Number of days with no outbound movement to qualify as dead stock',
    default: 90,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  days?: number = 90;
}
