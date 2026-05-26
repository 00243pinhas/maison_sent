import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { RoleName } from '../../common/enums/role.enum';
import { NotificationType } from '../../common/enums/notification-type.enum';
import { UsersService } from '../users/users.service';
import { ListNotificationsDto } from './dto/list-notifications.dto';
import { Notification } from './entities/notification.entity';
import { FirebaseService } from './firebase/firebase.service';

interface DispatchParams {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  dedupWindow?: {
    type: NotificationType;
    scope: Record<string, unknown>;
    hours: number;
  };
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    private readonly usersService: UsersService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async dispatch(params: DispatchParams): Promise<void> {
    const { recipientId, type, title, message, data, dedupWindow } = params;

    if (dedupWindow) {
      const since = new Date(Date.now() - dedupWindow.hours * 3_600_000);
      const existing = await this.repo
        .createQueryBuilder('n')
        .where('n.recipientId = :recipientId', { recipientId })
        .andWhere('n.type = :type', { type: dedupWindow.type })
        .andWhere('n.read = false')
        .andWhere('n.data @> :scope::jsonb', {
          scope: JSON.stringify(dedupWindow.scope),
        })
        .andWhere('n.createdAt >= :since', { since })
        .getOne();

      if (existing) return;
    }

    const notification = this.repo.create({
      recipientId,
      type,
      title,
      message,
      data: data ?? null,
      read: false,
    });
    await this.repo.save(notification);

    // Fire-and-forget push — failure must never bubble up
    this.sendPushSafe(recipientId, title, message, data).catch(() => undefined);
  }

  async dispatchBulk(
    recipientIds: string[],
    params: Omit<DispatchParams, 'recipientId'>,
  ): Promise<void> {
    await Promise.allSettled(
      recipientIds.map((id) => this.dispatch({ ...params, recipientId: id })),
    );
  }

  async findMine(
    userId: string,
    query: ListNotificationsDto,
  ): Promise<PaginatedResponse<Notification>> {
    const qb = this.repo
      .createQueryBuilder('n')
      .where('n.recipientId = :userId', { userId });

    if (query.read !== undefined) {
      qb.andWhere('n.read = :read', { read: query.read });
    }
    if (query.type) {
      qb.andWhere('n.type = :type', { type: query.type });
    }

    qb.orderBy('n.createdAt', 'DESC').skip(query.skip).take(query.take);

    const [data, total] = await qb.getManyAndCount();
    return PaginatedResponse.from(data, total, query);
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.repo.count({
      where: { recipientId: userId, read: false },
    });
    return { count };
  }

  async markRead(
    userId: string,
    notificationId: string,
  ): Promise<Notification> {
    const notification = await this.findOwned(userId, notificationId);
    if (notification.read) return notification;

    notification.read = true;
    notification.readAt = new Date();
    return this.repo.save(notification);
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const result = await this.repo
      .createQueryBuilder()
      .update(Notification)
      .set({ read: true, readAt: new Date() })
      .where('recipientId = :userId', { userId })
      .andWhere('read = false')
      .execute();

    return { updated: result.affected ?? 0 };
  }

  async delete(userId: string, notificationId: string): Promise<void> {
    const notification = await this.findOwned(userId, notificationId);
    await this.repo.remove(notification);
  }

  async updateFcmToken(userId: string, token: string): Promise<void> {
    await this.usersService.updateFcmToken(userId, token);
  }

  async clearFcmToken(userId: string): Promise<void> {
    await this.usersService.updateFcmToken(userId, null);
  }

  async resolveAdminRecipients(): Promise<string[]> {
    const users = await this.usersService.findUsersByRoles([
      RoleName.SUPER_ADMIN,
      RoleName.ADMIN,
    ]);
    return users.map((u) => u.id);
  }

  async resolveStockAlertRecipients(): Promise<string[]> {
    const users = await this.usersService.findUsersByRoles([
      RoleName.SUPER_ADMIN,
      RoleName.ADMIN,
      RoleName.WAREHOUSE_MANAGER,
    ]);
    return users.map((u) => u.id);
  }

  // ── private helpers ────────────────────────────────────────────────────────

  private async findOwned(userId: string, id: string): Promise<Notification> {
    const notification = await this.repo.findOne({ where: { id } });
    if (!notification)
      throw new NotFoundException(`Notification ${id} not found`);
    if (notification.recipientId !== userId) {
      throw new ForbiddenException(
        'You can only access your own notifications',
      );
    }
    return notification;
  }

  private async sendPushSafe(
    recipientId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    if (!this.firebaseService.isEnabled) return;

    const user = await this.usersService.findWithFcmToken(recipientId);
    if (!user?.fcmToken) return;

    try {
      await this.firebaseService.sendPush(user.fcmToken, title, body, data);
    } catch (err: unknown) {
      const code = (err as { errorInfo?: { code?: string } })?.errorInfo?.code;
      if (code === 'messaging/registration-token-not-registered') {
        await this.usersService
          .updateFcmToken(recipientId, null)
          .catch(() => undefined);
      }
      this.logger.error(`Push failed for user ${recipientId}`, err);
    }
  }
}
