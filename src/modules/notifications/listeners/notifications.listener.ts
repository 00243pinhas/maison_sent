import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationType } from '../../../common/enums/notification-type.enum';
import { Location } from '../../locations/entities/location.entity';
import { Product } from '../../products/entities/product.entity';
import {
  INVENTORY_OUTBOUND,
  TRANSFER_APPROVED,
  TRANSFER_COMPLETED,
  TRANSFER_REJECTED,
  TRANSFER_SUBMITTED,
} from '../events/notification-events';
import type {
  InventoryOutboundPayload,
  TransferApprovedPayload,
  TransferCompletedPayload,
  TransferRejectedPayload,
  TransferSubmittedPayload,
} from '../events/notification-events';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class NotificationsListener {
  private readonly logger = new Logger(NotificationsListener.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
  ) {}

  @OnEvent(TRANSFER_SUBMITTED)
  async onTransferSubmitted(payload: TransferSubmittedPayload): Promise<void> {
    try {
      const adminIds = await this.notificationsService.resolveAdminRecipients();
      const ref = payload.referenceNumber ?? payload.transferId.slice(0, 8);
      await this.notificationsService.dispatchBulk(adminIds, {
        type: NotificationType.TRANSFER_SUBMITTED,
        title: 'Transfer awaiting your approval',
        message: `Transfer ${ref} needs approval`,
        data: { transferId: payload.transferId },
      });
    } catch (err) {
      this.logger.error('onTransferSubmitted failed', err);
    }
  }

  @OnEvent(TRANSFER_APPROVED)
  async onTransferApproved(payload: TransferApprovedPayload): Promise<void> {
    try {
      await this.notificationsService.dispatch({
        recipientId: payload.creatorId,
        type: NotificationType.TRANSFER_APPROVED,
        title: 'Transfer approved',
        message: 'Your transfer has been approved and is ready to complete',
        data: { transferId: payload.transferId },
      });
    } catch (err) {
      this.logger.error('onTransferApproved failed', err);
    }
  }

  @OnEvent(TRANSFER_REJECTED)
  async onTransferRejected(payload: TransferRejectedPayload): Promise<void> {
    try {
      await this.notificationsService.dispatch({
        recipientId: payload.creatorId,
        type: NotificationType.TRANSFER_REJECTED,
        title: 'Transfer rejected',
        message: `Reason: ${payload.reason}`,
        data: { transferId: payload.transferId, reason: payload.reason },
      });
    } catch (err) {
      this.logger.error('onTransferRejected failed', err);
    }
  }

  @OnEvent(TRANSFER_COMPLETED)
  async onTransferCompleted(payload: TransferCompletedPayload): Promise<void> {
    try {
      await this.notificationsService.dispatch({
        recipientId: payload.creatorId,
        type: NotificationType.TRANSFER_COMPLETED,
        title: 'Transfer completed',
        message: 'Your transfer has been received at the destination',
        data: { transferId: payload.transferId },
      });
    } catch (err) {
      this.logger.error('onTransferCompleted failed', err);
    }
  }

  @OnEvent(INVENTORY_OUTBOUND)
  async onInventoryOutbound(payload: InventoryOutboundPayload): Promise<void> {
    try {
      const product = await this.productRepo.findOne({
        where: { id: payload.productId },
      });
      if (!product?.lowStockThreshold) return;
      if (payload.newBalance > product.lowStockThreshold) return;

      const location = await this.locationRepo.findOne({
        where: { id: payload.locationId },
      });
      const locationName = location?.name ?? payload.locationId;

      const recipientIds =
        await this.notificationsService.resolveStockAlertRecipients();

      await this.notificationsService.dispatchBulk(recipientIds, {
        type: NotificationType.LOW_STOCK_ALERT,
        title: 'Low stock',
        message: `${product.name} at ${locationName} is at ${payload.newBalance} (threshold ${product.lowStockThreshold})`,
        data: {
          productId: payload.productId,
          locationId: payload.locationId,
          balance: payload.newBalance,
          threshold: product.lowStockThreshold,
        },
        dedupWindow: {
          type: NotificationType.LOW_STOCK_ALERT,
          scope: {
            productId: payload.productId,
            locationId: payload.locationId,
          },
          hours: 24,
        },
      });
    } catch (err) {
      this.logger.error('onInventoryOutbound failed', err);
    }
  }
}
