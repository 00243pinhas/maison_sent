import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job, UnrecoverableError } from 'bullmq';
import { FirebaseService } from '../../notifications/firebase/firebase.service';
import { UsersService } from '../../users/users.service';
import type { SendPushPayload } from '../services/job-queue.service';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly usersService: UsersService,
  ) {
    super();
  }

  async process(job: Job<SendPushPayload>): Promise<void> {
    if (job.name === 'send-push') {
      await this.handleSendPush(job);
    }
  }

  private async handleSendPush(job: Job<SendPushPayload>): Promise<void> {
    const { userId, token, title, body, data, notificationId } = job.data;

    this.logger.debug(
      `Processing send-push job ${job.id} for notification ${notificationId} (user ${userId})`,
    );

    try {
      await this.firebaseService.sendPush(token, title, body, data);
      this.logger.debug(`Push delivered — job ${job.id}`);
    } catch (err: unknown) {
      const code = (err as { errorInfo?: { code?: string } })?.errorInfo?.code;

      if (code === 'messaging/registration-token-not-registered') {
        // Token is stale — clean up, then fail without retrying.
        await this.usersService.updateFcmToken(userId, null).catch(() => undefined);
        this.logger.warn(
          `Cleared stale FCM token for user ${userId} (job ${job.id})`,
        );
        throw new UnrecoverableError(
          `Stale FCM token for user ${userId} — token cleared, no retry`,
        );
      }

      this.logger.error(
        `Push failed for job ${job.id} (attempt ${job.attemptsMade + 1})`,
        err,
      );
      throw err;
    }
  }
}
