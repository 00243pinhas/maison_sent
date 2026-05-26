import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class DateRangeQueryDto {
  @ApiPropertyOptional({ description: 'Start of period (ISO 8601)' })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsDate()
  from?: Date;

  @ApiPropertyOptional({ description: 'End of period (ISO 8601)' })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsDate()
  to?: Date;
}
