import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationType } from '../../../common/enums/notification-type.enum';
import { InventoryBalancesService } from '../../inventory/inventory-balances.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { TransfersService } from '../../transfers/transfers.service';

export interface ScheduledJobResult {
  recipientsNotified: number;
  itemsReported: number;
}

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(
    private readonly inventoryBalancesService: InventoryBalancesService,
    private readonly transfersService: TransfersService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  async runLowStockDigest(): Promise<ScheduledJobResult> {
    const balances =
      await this.inventoryBalancesService.findBelowProductThresholds();

    if (balances.length === 0) {
      this.logger.log('Low-stock digest: no items below threshold — skipping.');
      return { recipientsNotified: 0, itemsReported: 0 };
    }

    const recipientIds =
      await this.notificationsService.resolveStockAlertRecipients();

    const locationIds = new Set(balances.map((b) => b.locationId));
    const message = `${balances.length} product(s) are below threshold across ${locationIds.size} location(s).`;

    const products = balances.map((b) => ({
      productId: b.productId,
      locationId: b.locationId,
      balance: b.quantity,
      threshold: b.product.lowStockThreshold,
    }));

    await Promise.allSettled(
      recipientIds.map((id) =>
        this.notificationsService.dispatch({
          recipientId: id,
          type: NotificationType.LOW_STOCK_ALERT,
          title: 'Daily low-stock digest',
          message,
          // kind: 'digest' ensures this doesn't dedup against realtime LOW_STOCK_ALERT per-product alerts
          data: { kind: 'digest', products } as Record<string, unknown>,
        }),
      ),
    );

    this.logger.log(
      `Low-stock digest sent to ${recipientIds.length} recipient(s), ${balances.length} item(s) reported.`,
    );
    return { recipientsNotified: recipientIds.length, itemsReported: balances.length };
  }

  async runStaleTransferReminder(): Promise<ScheduledJobResult> {
    const staleHours = Number(
      this.configService.get<string>('JOB_STALE_TRANSFER_HOURS', '48'),
    );
    const olderThan = new Date(Date.now() - staleHours * 3_600_000);

    const staleTransfers =
      await this.transfersService.findStalePendingApproval(olderThan);

    if (staleTransfers.length === 0) {
      this.logger.log('Stale-transfer reminder: no stale transfers — skipping.');
      return { recipientsNotified: 0, itemsReported: 0 };
    }

    const transferIds = staleTransfers.map((t) => t.id).sort();
    const adminIds = await this.notificationsService.resolveAdminRecipients();

    await Promise.allSettled(
      adminIds.map((id) =>
        this.notificationsService.dispatch({
          recipientId: id,
          type: NotificationType.STALE_TRANSFER_REMINDER,
          title: 'Transfers awaiting approval',
          message: `${staleTransfers.length} transfer(s) have been pending approval for over ${staleHours}h.`,
          data: { transferIds },
          dedupWindow: {
            type: NotificationType.STALE_TRANSFER_REMINDER,
            // Dedup on the exact set of stale IDs — prevents re-alerting within 12 h for the same set
            scope: { kind: 'stale-reminder', ids: transferIds.join(',') },
            hours: 12,
          },
        }),
      ),
    );

    this.logger.log(
      `Stale-transfer reminder sent to ${adminIds.length} admin(s), ${staleTransfers.length} transfer(s) reported.`,
    );
    return { recipientsNotified: adminIds.length, itemsReported: staleTransfers.length };
  }
}
