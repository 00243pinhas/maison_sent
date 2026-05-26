import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsOptional } from 'class-validator';

export enum PeriodInterval {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class SalesByPeriodQueryDto {
  @ApiProperty({ enum: PeriodInterval, description: 'Aggregation interval' })
  @IsEnum(PeriodInterval)
  interval: PeriodInterval;

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
