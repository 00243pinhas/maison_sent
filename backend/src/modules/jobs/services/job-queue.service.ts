import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ScheduledTasksService } from './scheduled-tasks.service';

export interface SendPushPayload {
  userId: string;
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  notificationId: string;
}

@Injectable()
export class JobQueueService {
  constructor(
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
    @InjectQueue('scheduled') private readonly scheduledQueue: Queue,
    private readonly scheduledTasksService: ScheduledTasksService,
  ) {}

  async enqueueSendPush(payload: SendPushPayload): Promise<void> {
    await this.notificationsQueue.add('send-push', payload);
  }

  async getQueueStats(queueName: 'notifications' | 'scheduled') {
    const queue = this.resolveQueue(queueName);
    const counts = await queue.getJobCounts(
      'waiting',
      'active',
      'completed',
      'failed',
      'delayed',
      'paused',
    );
    return {
      name: queueName,
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
      delayed: counts.delayed ?? 0,
      paused: counts.paused ?? 0,
    };
  }

  async listFailedJobs(queueName: 'notifications' | 'scheduled', limit = 50) {
    const queue = this.resolveQueue(queueName);
    const jobs = await queue.getFailed(0, limit - 1);
    return jobs.map((job) => ({
      id: job.id,
      name: job.name,
      data: job.data,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
    }));
  }

  async retryFailedJobs(
    queueName: 'notifications' | 'scheduled',
  ): Promise<{ retried: number }> {
    const queue = this.resolveQueue(queueName);
    const jobs = await queue.getFailed();
    await Promise.allSettled(jobs.map((job) => job.retry()));
    return { retried: jobs.length };
  }

  async pauseQueue(queueName: 'notifications' | 'scheduled'): Promise<void> {
    await this.resolveQueue(queueName).pause();
  }

  async resumeQueue(queueName: 'notifications' | 'scheduled'): Promise<void> {
    await this.resolveQueue(queueName).resume();
  }

  async runScheduledNow(
    jobName: 'low-stock-digest' | 'stale-transfer-reminder',
  ): Promise<{ recipientsNotified: number; itemsReported: number }> {
    if (jobName === 'low-stock-digest') {
      return this.scheduledTasksService.runLowStockDigest();
    }
    return this.scheduledTasksService.runStaleTransferReminder();
  }

  // ── helpers ────────────────────────────────────────────────────────────────

  private resolveQueue(name: 'notifications' | 'scheduled'): Queue {
    return name === 'notifications'
      ? this.notificationsQueue
      : this.scheduledQueue;
  }
}
