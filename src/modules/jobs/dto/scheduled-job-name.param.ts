import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class ScheduledJobNameParam {
  @ApiProperty({ enum: ['low-stock-digest', 'stale-transfer-reminder'] })
  @IsString()
  @IsIn(['low-stock-digest', 'stale-transfer-reminder'])
  name: string;
}
