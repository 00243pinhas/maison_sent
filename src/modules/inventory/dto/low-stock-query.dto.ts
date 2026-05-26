import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class LowStockQueryDto extends PaginationQueryDto {
  @ApiProperty({
    type: Number,
    minimum: 1,
    description: 'Balances with quantity below this threshold are returned',
  })
  @IsInt()
  @Min(1)
  threshold: number;
}
