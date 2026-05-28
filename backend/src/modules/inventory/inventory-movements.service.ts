import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { MovementType } from '../../common/enums/movement-type.enum';
import { MovementQueryDto } from './dto/movement-query.dto';
import { InventoryMovement } from './entities/inventory-movement.entity';

export interface CreateMovementData {
  productId: string;
  movementType: MovementType;
  quantity: number;
  fromLocationId: string | null;
  toLocationId: string | null;
  referenceNumber: string | null;
  performedBy: string;
  notes: string | null;
  unitCostPrice: number | null;
  unitSellingPrice: number | null;
}

@Injectable()
export class InventoryMovementsService {
  constructor(
    @InjectRepository(InventoryMovement)
    private readonly repo: Repository<InventoryMovement>,
  ) {}

  /**
   * Internal: inserts the movement row inside an existing transaction.
   * Callers must pass the transaction's EntityManager.
   */
  async create(
    data: CreateMovementData,
    manager: EntityManager,
  ): Promise<InventoryMovement> {
    const movement = manager.getRepository(InventoryMovement).create(data);
    const saved = await manager.getRepository(InventoryMovement).save(movement);

    // Reload within the transaction to populate all eager relations.
    const reloaded = await manager
      .getRepository(InventoryMovement)
      .findOne({ where: { id: saved.id } });

    return reloaded!;
  }

  async findById(id: string): Promise<InventoryMovement> {
    const movement = await this.repo.findOne({ where: { id } });
    if (!movement) throw new NotFoundException(`Movement ${id} not found`);
    return movement;
  }

  async findAll(
    query: MovementQueryDto,
  ): Promise<PaginatedResponse<InventoryMovement>> {
    const qb = this.repo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.supplier', 'supplier')
      .leftJoinAndSelect('m.fromLocation', 'fromLocation')
      .leftJoinAndSelect('m.toLocation', 'toLocation')
      .leftJoinAndSelect('m.performer', 'performer')
      .leftJoinAndSelect('performer.role', 'role');

    if (query.productId) {
      qb.andWhere('m.productId = :productId', { productId: query.productId });
    }
    if (query.locationId) {
      qb.andWhere(
        '(m.fromLocationId = :locationId OR m.toLocationId = :locationId)',
        { locationId: query.locationId },
      );
    }
    if (query.movementType) {
      qb.andWhere('m.movementType = :movementType', {
        movementType: query.movementType,
      });
    }
    if (query.performedBy) {
      qb.andWhere('m.performedBy = :performedBy', {
        performedBy: query.performedBy,
      });
    }
    if (query.referenceNumber) {
      qb.andWhere('m.referenceNumber = :referenceNumber', {
        referenceNumber: query.referenceNumber,
      });
    }
    if (query.from) {
      qb.andWhere('m.createdAt >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('m.createdAt <= :to', { to: query.to });
    }

    qb.orderBy('m.createdAt', 'DESC').skip(query.skip).take(query.take);

    const [data, total] = await qb.getManyAndCount();
    return PaginatedResponse.from(data, total, query);
  }
}
