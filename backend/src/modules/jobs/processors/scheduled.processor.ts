import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ScheduledTasksService } from '../services/scheduled-tasks.service';

@Processor('scheduled')
export class ScheduledProcessor extends WorkerHost {
  private readonly logger = new Logger(ScheduledProcessor.name);

  constructor(private readonly scheduledTasksService: ScheduledTasksService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Starting scheduled job: ${job.name} (id=${job.id})`);

    try {
      if (job.name === 'low-stock-digest') {
        const result = await this.scheduledTasksService.runLowStockDigest();
        this.logger.log(
          `low-stock-digest done — ${result.recipientsNotified} recipients, ${result.itemsReported} items`,
        );
      } else if (job.name === 'stale-transfer-reminder') {
        const result =
          await this.scheduledTasksService.runStaleTransferReminder();
        this.logger.log(
          `stale-transfer-reminder done — ${result.recipientsNotified} recipients, ${result.itemsReported} transfers`,
        );
      } else {
        this.logger.warn(`Unknown scheduled job name: ${job.name}`);
      }
    } catch (err) {
      this.logger.error(`Scheduled job ${job.name} failed`, err);
      throw err;
    }
  }
}
