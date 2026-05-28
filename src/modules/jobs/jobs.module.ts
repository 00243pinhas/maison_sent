import { BullModule } from '@nestjs/bullmq';
import {
  Logger,
  Module,
  OnApplicationBootstrap,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RolesGuard } from '../../common/guards/roles.guard';
import { InventoryModule } from '../inventory/inventory.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProductsModule } from '../products/products.module';
import { TransfersModule } from '../transfers/transfers.module';
import { UsersModule } from '../users/users.module';
import { JobsController } from './jobs.controller';
import { NotificationsProcessor } from './processors/notifications.processor';
import { ScheduledProcessor } from './processors/scheduled.processor';
import { JobQueueService } from './services/job-queue.service';
import { ScheduledTasksService } from './services/scheduled-tasks.service';

// TODO Phase 8+: extract workers to a separate process for horizontal scaling.
// Currently both the HTTP server and BullMQ workers run in-process.

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = process.env.REDIS_URL || config.get<string>('REDIS_URL');
        let connection: Record<string, unknown>;

        if (redisUrl) {
          const url = new URL(redisUrl);
          connection = {
            host: url.hostname,
            port: parseInt(url.port || '6379'),
            password: url.password || undefined,
            db: parseInt(url.pathname?.slice(1) || '0') || 0,
            tls: redisUrl.startsWith('rediss://') ? {} : undefined,
            connectTimeout: 5000,
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
          };
        } else {
          connection = {
            host: config.get<string>('REDIS_HOST', 'localhost'),
            port: config.get<number>('REDIS_PORT', 6379),
            password: config.get<string>('REDIS_PASSWORD') || undefined,
            db: config.get<number>('REDIS_DB', 0),
            connectTimeout: 5000,
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
          };
        }

        return {
          connection,
          prefix: config.get<string>('QUEUE_PREFIX', 'maison-sent'),
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: { age: 86400, count: 1000 },
            removeOnFail: { age: 604800 },
          },
        };
      },
    }),
    BullModule.registerQueue({ name: 'notifications' }, { name: 'scheduled' }),
    UsersModule,
    forwardRef(() => NotificationsModule),
    InventoryModule,
    TransfersModule,
    ProductsModule,
  ],
  controllers: [JobsController],
  providers: [
    NotificationsProcessor,
    ScheduledProcessor,
    JobQueueService,
    ScheduledTasksService,
    RolesGuard,
  ],
  exports: [JobQueueService],
})
export class JobsModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(JobsModule.name);

  constructor(
    @InjectQueue('scheduled') private readonly scheduledQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    // Verify Redis is reachable — fail loudly so ops knows immediately.
    // getJobCounts hangs indefinitely if Redis is down (ioredis keeps retrying),
    // so we race it against a 5-second timeout.
    const healthTimeout = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('Redis health check timed out after 5s')),
        5000,
      ),
    );
    try {
      await Promise.race([
        this.scheduledQueue.getJobCounts('waiting'),
        healthTimeout,
      ]);
      this.logger.log('Redis connection verified.');
    } catch (err) {
      this.logger.error(
        'FATAL: Redis is unreachable. Application cannot start without working queues.',
        err,
      );
      process.exit(1);
    }

    // Register repeatable jobs with stable IDs (idempotent re-registration)
    const tz = this.configService.get<string>('APP_TIMEZONE', 'Africa/Harare');
    const digestHour = this.configService.get<string>(
      'JOB_LOW_STOCK_DIGEST_HOUR',
      '8',
    );

    await this.scheduledQueue.add(
      'low-stock-digest',
      {},
      {
        repeat: { pattern: `0 ${digestHour} * * *`, tz },
        jobId: 'low-stock-digest-daily',
      },
    );

    await this.scheduledQueue.add(
      'stale-transfer-reminder',
      {},
      {
        repeat: { pattern: '0 */6 * * *', tz },
        jobId: 'stale-transfer-reminder',
      },
    );

    this.logger.log(
      `Repeatable jobs registered (tz=${tz}, digest@${digestHour}h, stale-reminder every 6h).`,
    );
  }
}
