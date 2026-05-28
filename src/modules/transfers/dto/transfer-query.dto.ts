import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { TransferStatus } from '../../../common/enums/transfer-status.enum';

export class TransferQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: TransferStatus })
  @IsOptional()
  @IsEnum(TransferStatus)
  status?: TransferStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  fromLocationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  toLocationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  approvedBy?: string;

  @ApiPropertyOptional({
    description: 'Filter by createdAt >= from (ISO date string)',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description: 'Filter by createdAt <= to (ISO date string)',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
