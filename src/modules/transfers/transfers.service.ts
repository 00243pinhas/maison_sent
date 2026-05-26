import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { RoleName } from '../../common/enums/role.enum';
import {
  TRANSFER_TRANSITIONS,
  TransferStatus,
} from '../../common/enums/transfer-status.enum';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { InventoryBalancesService } from '../inventory/inventory-balances.service';
import { InventoryService } from '../inventory/inventory.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreateTransferItemDto } from './dto/create-transfer-item.dto';
import { RejectTransferDto } from './dto/reject-transfer.dto';
import { TransferQueryDto } from './dto/transfer-query.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { UpdateTransferItemDto } from './dto/update-transfer-item.dto';
import { TransferItem } from './entities/transfer-item.entity';
import { Transfer } from './entities/transfer.entity';

@Injectable()
export class TransfersService {
  constructor(
    @InjectRepository(Transfer)
    private readonly transferRepo: Repository<Transfer>,
    @InjectRepository(TransferItem)
    private readonly transferItemRepo: Repository<TransferItem>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly inventoryService: InventoryService,
    private readonly inventoryBalancesService: InventoryBalancesService,
  ) {}

  async create(dto: CreateTransferDto, creatorId: string): Promise<Transfer> {
    if (dto.fromLocationId === dto.toLocationId) {
      throw new ConflictException(
        'Source and destination locations must differ',
      );
    }

    if (dto.items?.length) {
      const productIds = dto.items.map((i) => i.productId);
      if (new Set(productIds).size !== productIds.length) {
        throw new ConflictException(
          'Duplicate productId in transfer items payload',
        );
      }
    }

    const transfer = this.transferRepo.create({
      fromLocationId: dto.fromLocationId,
      toLocationId: dto.toLocationId,
      referenceNumber: dto.referenceNumber ?? null,
      notes: dto.notes ?? null,
      createdBy: creatorId,
      status: TransferStatus.DRAFT,
      items:
        dto.items?.map((item) =>
          this.transferItemRepo.create({
            productId: item.productId,
            quantity: item.quantity,
          }),
        ) ?? [],
    });

    const saved = await this.transferRepo.save(transfer);
    return this.findById(saved.id);
  }

  async findAll(query: TransferQueryDto): Promise<PaginatedResponse<Transfer>> {
    const qb = this.transferRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.fromLocation', 'fromLocation')
      .leftJoinAndSelect('t.toLocation', 'toLocation')
      .leftJoinAndSelect('t.creator', 'creator')
      .leftJoinAndSelect('t.approver', 'approver')
      .leftJoinAndSelect('t.completer', 'completer')
      .leftJoinAndSelect('t.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('t.deletedAt IS NULL');

    if (query.status) {
      qb.andWhere('t.status = :status', { status: query.status });
    }
    if (query.fromLocationId) {
      qb.andWhere('t.fromLocationId = :fromLocationId', {
        fromLocationId: query.fromLocationId,
      });
    }
    if (query.toLocationId) {
      qb.andWhere('t.toLocationId = :toLocationId', {
        toLocationId: query.toLocationId,
      });
    }
    if (query.createdBy) {
      qb.andWhere('t.createdBy = :createdBy', { createdBy: query.createdBy });
    }
    if (query.approvedBy) {
      qb.andWhere('t.approvedBy = :approvedBy', {
        approvedBy: query.approvedBy,
      });
    }
    if (query.from) {
      qb.andWhere('t.createdAt >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('t.createdAt <= :to', { to: query.to });
    }

    qb.orderBy('t.createdAt', 'DESC').skip(query.skip).take(query.take);

    const [data, total] = await qb.getManyAndCount();
    return PaginatedResponse.from(data, total, query);
  }

  async findById(id: string): Promise<Transfer> {
    const transfer = await this.transferRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.fromLocation', 'fromLocation')
      .leftJoinAndSelect('t.toLocation', 'toLocation')
      .leftJoinAndSelect('t.creator', 'creator')
      .leftJoinAndSelect('t.approver', 'approver')
      .leftJoinAndSelect('t.completer', 'completer')
      .leftJoinAndSelect('t.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('t.id = :id', { id })
      .andWhere('t.deletedAt IS NULL')
      .getOne();

    if (!transfer) throw new NotFoundException(`Transfer ${id} not found`);
    return transfer;
  }

  async update(
    id: string,
    dto: UpdateTransferDto,
    userId: string,
    userRole: RoleName,
  ): Promise<Transfer> {
    const transfer = await this.findById(id);

    if (transfer.status !== TransferStatus.DRAFT) {
      throw new ConflictException('Transfer can only be edited while in DRAFT');
    }
    this.assertEditPermission(transfer, userId, userRole);

    if (dto.referenceNumber !== undefined)
      transfer.referenceNumber = dto.referenceNumber;
    if (dto.notes !== undefined) transfer.notes = dto.notes;

    await this.transferRepo.save(transfer);
    return this.findById(id);
  }

  async addItem(
    transferId: string,
    dto: CreateTransferItemDto,
    userId: string,
    userRole: RoleName,
  ): Promise<Transfer> {
    const transfer = await this.findById(transferId);

    if (transfer.status !== TransferStatus.DRAFT) {
      throw new ConflictException('Transfer can only be edited while in DRAFT');
    }
    this.assertEditPermission(transfer, userId, userRole);

    if (transfer.items.some((i) => i.productId === dto.productId)) {
      throw new ConflictException(
        `Product ${dto.productId} already exists in this transfer`,
      );
    }

    const item = this.transferItemRepo.create({
      transferId,
      productId: dto.productId,
      quantity: dto.quantity,
    });
    await this.transferItemRepo.save(item);

    return this.findById(transferId);
  }

  async updateItem(
    transferId: string,
    itemId: string,
    dto: UpdateTransferItemDto,
    userId: string,
    userRole: RoleName,
  ): Promise<Transfer> {
    const transfer = await this.findById(transferId);

    if (transfer.status !== TransferStatus.DRAFT) {
      throw new ConflictException('Transfer can only be edited while in DRAFT');
    }
    this.assertEditPermission(transfer, userId, userRole);

    const item = transfer.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException(
        `Item ${itemId} not found in transfer ${transferId}`,
      );
    }

    item.quantity = dto.quantity;
    await this.transferItemRepo.save(item);

    return this.findById(transferId);
  }

  async removeItem(
    transferId: string,
    itemId: string,
    userId: string,
    userRole: RoleName,
  ): Promise<Transfer> {
    const transfer = await this.findById(transferId);

    if (transfer.status !== TransferStatus.DRAFT) {
      throw new ConflictException('Transfer can only be edited while in DRAFT');
    }
    this.assertEditPermission(transfer, userId, userRole);

    const item = transfer.items.find((i) => i.id === itemId);
    if (!item) {
      throw new NotFoundException(
        `Item ${itemId} not found in transfer ${transferId}`,
      );
    }

    await this.transferItemRepo.remove(item);
    return this.findById(transferId);
  }

  async submit(
    id: string,
    userId: string,
    userRole: RoleName,
  ): Promise<Transfer> {
    const transfer = await this.findById(id);
    this.assertTransition(transfer.status, TransferStatus.PENDING_APPROVAL);

    if (!transfer.items.length) {
      throw new ConflictException(
        'Transfer must have at least one item before submitting',
      );
    }
    this.assertEditPermission(transfer, userId, userRole);

    transfer.status = TransferStatus.PENDING_APPROVAL;
    // TODO Notifications: notify approvers
    await this.transferRepo.save(transfer);
    return this.findById(id);
  }

  async approve(id: string, approverId: string): Promise<Transfer> {
    await this.dataSource.transaction(async (manager) => {
      const transfer = await this.loadInTransaction(id, manager);
      this.assertTransition(transfer.status, TransferStatus.APPROVED);

      // Lock source-side balance rows and verify availability at approval time.
      const shortages: string[] = [];
      for (const item of transfer.items) {
        const available = await this.inventoryBalancesService.getLockedQuantity(
          item.productId,
          transfer.fromLocationId,
          manager,
        );
        if (available < item.quantity) {
          shortages.push(
            `Product ${item.productId}: available ${available}, requested ${item.quantity}`,
          );
        }
      }

      if (shortages.length > 0) {
        throw new ConflictException(
          `Insufficient stock at source location: ${shortages.join('; ')}`,
        );
      }

      transfer.status = TransferStatus.APPROVED;
      transfer.approvedBy = approverId;
      transfer.approvedAt = new Date();
      // TODO Notifications: notify creator + destination location

      await manager.getRepository(Transfer).save(transfer);
    });

    return this.findById(id);
  }

  async reject(
    id: string,
    approverId: string,
    dto: RejectTransferDto,
  ): Promise<Transfer> {
    const transfer = await this.findById(id);
    this.assertTransition(transfer.status, TransferStatus.REJECTED);

    transfer.status = TransferStatus.REJECTED;
    transfer.rejectionReason = dto.rejectionReason;
    // Both approve and reject are treated as approval decisions.
    transfer.approvedBy = approverId;
    transfer.approvedAt = new Date();
    // TODO Notifications: notify creator

    await this.transferRepo.save(transfer);
    return this.findById(id);
  }

  async cancel(
    id: string,
    userId: string,
    userRole: RoleName,
  ): Promise<Transfer> {
    const transfer = await this.findById(id);
    this.assertTransition(transfer.status, TransferStatus.CANCELLED);
    this.assertEditPermission(transfer, userId, userRole);

    transfer.status = TransferStatus.CANCELLED;
    await this.transferRepo.save(transfer);
    return this.findById(id);
  }

  async complete(id: string, completerId: string): Promise<Transfer> {
    await this.dataSource.transaction(async (manager) => {
      // Lock the transfer header row to prevent double-completion.
      // PostgreSQL prohibits FOR UPDATE on the nullable side of an outer join,
      // so we lock the header alone first and load items in a second query.
      const header = await manager
        .getRepository(Transfer)
        .createQueryBuilder('t')
        .setLock('pessimistic_write')
        .where('t.id = :id', { id })
        .andWhere('t.deletedAt IS NULL')
        .getOne();

      if (!header) throw new NotFoundException(`Transfer ${id} not found`);
      this.assertTransition(header.status, TransferStatus.COMPLETED);

      const transfer = await this.loadInTransaction(id, manager);

      // Re-validate stock at the source — stock may have moved since approval.
      const shortages: string[] = [];
      for (const item of transfer.items) {
        const balance =
          await this.inventoryBalancesService.findByProductAndLocation(
            item.productId,
            transfer.fromLocationId,
            manager,
          );
        const available = balance?.quantity ?? 0;
        if (available < item.quantity) {
          shortages.push(
            `Product ${item.productId}: available ${available}, requested ${item.quantity}`,
          );
        }
      }

      if (shortages.length > 0) {
        throw new ConflictException(
          `Insufficient stock at source location: ${shortages.join('; ')}`,
        );
      }

      // Write all inventory movements inside the same transaction.
      await this.inventoryService.recordTransferBatch(
        {
          fromLocationId: transfer.fromLocationId,
          toLocationId: transfer.toLocationId,
          items: transfer.items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          performedById: completerId,
          referenceNumber: transfer.referenceNumber,
          notes: transfer.notes,
        },
        manager,
      );

      transfer.status = TransferStatus.COMPLETED;
      transfer.completedBy = completerId;
      transfer.completedAt = new Date();
      // TODO Notifications: notify creator + destination location

      await manager.getRepository(Transfer).save(transfer);
    });

    return this.findById(id);
  }

  // ── private helpers ────────────────────────────────────────────────────────

  private assertTransition(
    current: TransferStatus,
    target: TransferStatus,
  ): void {
    const allowed = TRANSFER_TRANSITIONS[current];
    if (!allowed.includes(target)) {
      const allowedList = allowed.length ? allowed.join(', ') : 'none';
      throw new ConflictException(
        `Illegal status transition: ${current} → ${target}. Allowed from ${current}: [${allowedList}]`,
      );
    }
  }

  private assertEditPermission(
    transfer: Transfer,
    userId: string,
    userRole: RoleName,
  ): void {
    const isAdmin =
      userRole === RoleName.SUPER_ADMIN || userRole === RoleName.ADMIN;
    if (!isAdmin && transfer.createdBy !== userId) {
      throw new ForbiddenException(
        'You can only edit transfers that you created',
      );
    }
  }

  private async loadInTransaction(
    id: string,
    manager: EntityManager,
  ): Promise<Transfer> {
    const transfer = await manager
      .getRepository(Transfer)
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.items', 'items')
      .where('t.id = :id', { id })
      .andWhere('t.deletedAt IS NULL')
      .getOne();

    if (!transfer) throw new NotFoundException(`Transfer ${id} not found`);
    return transfer;
  }
}
