import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class QueueNameParam {
  @ApiProperty({ enum: ['notifications', 'scheduled'] })
  @IsString()
  @IsIn(['notifications', 'scheduled'])
  name: string;
}
