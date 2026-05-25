import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { MovementType } from '../../../common/enums/movement-type.enum';

export class MovementQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  productId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Matches either fromLocationId or toLocationId' })
  @IsOptional()
  @IsUUID('4')
  locationId?: string;

  @ApiPropertyOptional({ enum: MovementType })
  @IsOptional()
  @IsEnum(MovementType)
  movementType?: MovementType;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  performedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiPropertyOptional({ description: 'Filter movements on or after this date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'Filter movements on or before this date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  to?: string;
}
