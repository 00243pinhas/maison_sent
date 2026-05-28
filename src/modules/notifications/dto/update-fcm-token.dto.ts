import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class UpdateFcmTokenDto {
  @ApiProperty({
    description: 'Firebase Cloud Messaging device token',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  token: string;
}
