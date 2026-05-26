import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../common/enums/role.enum';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QueueNameParam } from './dto/queue-name.param';
import { ScheduledJobNameParam } from './dto/scheduled-job-name.param';
import { JobQueueService } from './services/job-queue.service';

@ApiTags('Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.SUPER_ADMIN)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobQueueService: JobQueueService) {}

  @Get('queues')
  @ApiOperation({ summary: 'Stats for all queues' })
  @ApiOkResponse({ description: 'Queue statistics' })
  async getQueueStats() {
    const [notifications, scheduled] = await Promise.all([
      this.jobQueueService.getQueueStats('notifications'),
      this.jobQueueService.getQueueStats('scheduled'),
    ]);
    return { notifications, scheduled };
  }

  @Get('queues/:name/failed')
  @ApiOperation({ summary: 'List recent failed jobs (max 50)' })
  listFailed(@Param() params: QueueNameParam) {
    return this.jobQueueService.listFailedJobs(
      params.name as 'notifications' | 'scheduled',
    );
  }

  @Post('queues/:name/retry-failed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry all failed jobs in a queue' })
  retryFailed(@Param() params: QueueNameParam) {
    return this.jobQueueService.retryFailedJobs(
      params.name as 'notifications' | 'scheduled',
    );
  }

  @Post('queues/:name/pause')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause queue processing' })
  async pauseQueue(@Param() params: QueueNameParam) {
    await this.jobQueueService.pauseQueue(
      params.name as 'notifications' | 'scheduled',
    );
    return { paused: true, queue: params.name };
  }

  @Post('queues/:name/resume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resume queue processing' })
  async resumeQueue(@Param() params: QueueNameParam) {
    await this.jobQueueService.resumeQueue(
      params.name as 'notifications' | 'scheduled',
    );
    return { paused: false, queue: params.name };
  }

  @Post('scheduled/:name/run-now')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually trigger a scheduled job immediately' })
  runNow(@Param() params: ScheduledJobNameParam) {
    return this.jobQueueService.runScheduledNow(
      params.name as 'low-stock-digest' | 'stale-transfer-reminder',
    );
  }
}
