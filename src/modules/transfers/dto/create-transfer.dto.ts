import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateTransferItemDto } from './create-transfer-item.dto';

export class CreateTransferDto {
  @ApiProperty({ description: 'Source location UUID' })
  @IsUUID()
  fromLocationId: string;

  @ApiProperty({ description: 'Destination location UUID' })
  @IsUUID()
  toLocationId: string;

  @ApiPropertyOptional({ maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  referenceNumber?: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ type: [CreateTransferItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransferItemDto)
  items?: CreateTransferItemDto[];
}
