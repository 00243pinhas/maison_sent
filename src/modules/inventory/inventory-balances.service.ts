import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { BalanceQueryDto } from './dto/balance-query.dto';
import { LowStockQueryDto } from './dto/low-stock-query.dto';
import { InventoryBalance } from './entities/inventory-balance.entity';

@Injectable()
export class InventoryBalancesService {
  constructor(
    @InjectRepository(InventoryBalance)
    private readonly repo: Repository<InventoryBalance>,
  ) {}

  async findByProductAndLocation(
    productId: string,
    locationId: string,
    manager?: EntityManager,
  ): Promise<InventoryBalance | null> {
    const repo = manager ? manager.getRepository(InventoryBalance) : this.repo;
    return repo.findOne({ where: { productId, locationId } });
  }

  async findAll(query: BalanceQueryDto): Promise<PaginatedResponse<InventoryBalance>> {
    const qb = this.repo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.product', 'product')
      .leftJoinAndSelect('b.location', 'location')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.supplier', 'supplier');

    if (query.productId) {
      qb.andWhere('b.productId = :productId', { productId: query.productId });
    }
    if (query.locationId) {
      qb.andWhere('b.locationId = :locationId', { locationId: query.locationId });
    }
    if (query.minQuantity !== undefined) {
      qb.andWhere('b.quantity >= :minQty', { minQty: query.minQuantity });
    }
    if (query.maxQuantity !== undefined) {
      qb.andWhere('b.quantity <= :maxQty', { maxQty: query.maxQuantity });
    }

    qb.orderBy('location.name', 'ASC')
      .addOrderBy('product.name', 'ASC')
      .skip(query.skip)
      .take(query.take);

    const [data, total] = await qb.getManyAndCount();
    return PaginatedResponse.from(data, total, query);
  }

  async findLowStock(query: LowStockQueryDto): Promise<PaginatedResponse<InventoryBalance>> {
    const qb = this.repo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.product', 'product')
      .leftJoinAndSelect('b.location', 'location')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.supplier', 'supplier')
      .where('b.quantity < :threshold', { threshold: query.threshold })
      .orderBy('b.quantity', 'ASC')
      .addOrderBy('product.name', 'ASC')
      .skip(query.skip)
      .take(query.take);

    const [data, total] = await qb.getManyAndCount();
    return PaginatedResponse.from(data, total, query);
  }

  /**
   * Ensures a zero-quantity balance row exists for the given (product, location) pair
   * and locks it with SELECT FOR UPDATE. Must be called inside a transaction.
   */
  async getOrCreate(
    productId: string,
    locationId: string,
    manager: EntityManager,
  ): Promise<InventoryBalance> {
    // Insert a zero-qty row if none exists — idempotent on concurrent inserts.
    await manager.query(
      `INSERT INTO inventory_balances (id, product_id, location_id, quantity, updated_at)
       VALUES (gen_random_uuid(), $1, $2, 0, now())
       ON CONFLICT (product_id, location_id) DO NOTHING`,
      [productId, locationId],
    );

    // Acquire a pessimistic write lock for the rest of the transaction.
    const balance = await manager
      .getRepository(InventoryBalance)
      .createQueryBuilder('b')
      .setLock('pessimistic_write')
      .where('b.productId = :productId AND b.locationId = :locationId', {
        productId,
        locationId,
      })
      .getOne();

    if (!balance) {
      throw new InternalServerErrorException(
        `Balance row not found after insert for product=${productId} location=${locationId}`,
      );
    }

    return balance;
  }

  /**
   * Applies a signed delta to a balance row that was already locked via getOrCreate.
   * Throws 409 if the result would be negative. Must be called inside a transaction.
   */
  async applyDelta(
    productId: string,
    locationId: string,
    delta: number,
    manager: EntityManager,
  ): Promise<void> {
    const balance = await manager
      .getRepository(InventoryBalance)
      .findOne({ where: { productId, locationId } });

    if (!balance) {
      throw new InternalServerErrorException(
        `Balance row missing for product=${productId} location=${locationId}`,
      );
    }

    const newQty = balance.quantity + delta;
    if (newQty < 0) {
      throw new ConflictException(
        `Insufficient stock: available ${balance.quantity}, requested ${Math.abs(delta)}`,
      );
    }

    await manager
      .getRepository(InventoryBalance)
      .update({ productId, locationId }, { quantity: newQty });
  }
}
