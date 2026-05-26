import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { MovementType } from '../../common/enums/movement-type.enum';
import { Location } from '../locations/entities/location.entity';
import { Product } from '../products/entities/product.entity';
import { AdjustDirection, AdjustStockDto } from './dto/adjust-stock.dto';
import { RecordDamageDto } from './dto/record-damage.dto';
import { RecordReturnDto } from './dto/record-return.dto';
import { RecordSaleDto } from './dto/record-sale.dto';
import { ReceiveStockDto } from './dto/receive-stock.dto';
import { InventoryBalance } from './entities/inventory-balance.entity';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { InventoryBalancesService } from './inventory-balances.service';
import {
  CreateMovementData,
  InventoryMovementsService,
} from './inventory-movements.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly inventoryBalancesService: InventoryBalancesService,
    private readonly inventoryMovementsService: InventoryMovementsService,
  ) {}

  async receiveStock(
    dto: ReceiveStockDto,
    performedById: string,
  ): Promise<InventoryMovement> {
    return this.dataSource.transaction(async (manager) => {
      const product = await this.validateProduct(dto.productId, manager);
      await this.validateLocation(dto.toLocationId, manager);

      await this.inventoryBalancesService.getOrCreate(
        dto.productId,
        dto.toLocationId,
        manager,
      );
      await this.inventoryBalancesService.applyDelta(
        dto.productId,
        dto.toLocationId,
        dto.quantity,
        manager,
      );

      return this.inventoryMovementsService.create(
        this.buildMovementData({
          productId: dto.productId,
          movementType: MovementType.RECEIVED,
          quantity: dto.quantity,
          fromLocationId: null,
          toLocationId: dto.toLocationId,
          referenceNumber: dto.referenceNumber ?? null,
          performedBy: performedById,
          notes: dto.notes ?? null,
          unitCostPrice: product.costPrice ?? null,
          unitSellingPrice: product.sellingPrice ?? null,
        }),
        manager,
      );
    });
  }

  async recordSale(
    dto: RecordSaleDto,
    performedById: string,
  ): Promise<InventoryMovement> {
    return this.dataSource.transaction(async (manager) => {
      const product = await this.validateProduct(dto.productId, manager);
      await this.validateLocation(dto.fromLocationId, manager);

      await this.inventoryBalancesService.getOrCreate(
        dto.productId,
        dto.fromLocationId,
        manager,
      );
      await this.inventoryBalancesService.applyDelta(
        dto.productId,
        dto.fromLocationId,
        -dto.quantity,
        manager,
      );

      return this.inventoryMovementsService.create(
        this.buildMovementData({
          productId: dto.productId,
          movementType: MovementType.SALE,
          quantity: dto.quantity,
          fromLocationId: dto.fromLocationId,
          toLocationId: null,
          referenceNumber: dto.referenceNumber ?? null,
          performedBy: performedById,
          notes: dto.notes ?? null,
          unitCostPrice: product.costPrice ?? null,
          unitSellingPrice: product.sellingPrice ?? null,
        }),
        manager,
      );
    });
  }

  async recordReturn(
    dto: RecordReturnDto,
    performedById: string,
  ): Promise<InventoryMovement> {
    return this.dataSource.transaction(async (manager) => {
      const product = await this.validateProduct(dto.productId, manager);
      await this.validateLocation(dto.toLocationId, manager);

      await this.inventoryBalancesService.getOrCreate(
        dto.productId,
        dto.toLocationId,
        manager,
      );
      await this.inventoryBalancesService.applyDelta(
        dto.productId,
        dto.toLocationId,
        dto.quantity,
        manager,
      );

      return this.inventoryMovementsService.create(
        this.buildMovementData({
          productId: dto.productId,
          movementType: MovementType.RETURN,
          quantity: dto.quantity,
          fromLocationId: null,
          toLocationId: dto.toLocationId,
          referenceNumber: dto.referenceNumber ?? null,
          performedBy: performedById,
          notes: dto.notes ?? null,
          unitCostPrice: product.costPrice ?? null,
          unitSellingPrice: product.sellingPrice ?? null,
        }),
        manager,
      );
    });
  }

  async recordDamage(
    dto: RecordDamageDto,
    performedById: string,
  ): Promise<InventoryMovement> {
    return this.dataSource.transaction(async (manager) => {
      const product = await this.validateProduct(dto.productId, manager);
      await this.validateLocation(dto.fromLocationId, manager);

      await this.inventoryBalancesService.getOrCreate(
        dto.productId,
        dto.fromLocationId,
        manager,
      );
      await this.inventoryBalancesService.applyDelta(
        dto.productId,
        dto.fromLocationId,
        -dto.quantity,
        manager,
      );

      return this.inventoryMovementsService.create(
        this.buildMovementData({
          productId: dto.productId,
          movementType: MovementType.DAMAGE,
          quantity: dto.quantity,
          fromLocationId: dto.fromLocationId,
          toLocationId: null,
          referenceNumber: dto.referenceNumber ?? null,
          performedBy: performedById,
          notes: dto.notes ?? null,
          unitCostPrice: product.costPrice ?? null,
          unitSellingPrice: product.sellingPrice ?? null,
        }),
        manager,
      );
    });
  }

  async adjustStock(
    dto: AdjustStockDto,
    performedById: string,
  ): Promise<InventoryMovement> {
    const isIncrease = dto.direction === AdjustDirection.INCREASE;
    const movementType = isIncrease
      ? MovementType.ADJUSTMENT_IN
      : MovementType.ADJUSTMENT_OUT;
    const delta = isIncrease ? dto.quantity : -dto.quantity;

    return this.dataSource.transaction(async (manager) => {
      const product = await this.validateProduct(dto.productId, manager);
      await this.validateLocation(dto.locationId, manager);

      await this.inventoryBalancesService.getOrCreate(
        dto.productId,
        dto.locationId,
        manager,
      );
      await this.inventoryBalancesService.applyDelta(
        dto.productId,
        dto.locationId,
        delta,
        manager,
      );

      return this.inventoryMovementsService.create(
        this.buildMovementData({
          productId: dto.productId,
          movementType,
          quantity: dto.quantity,
          fromLocationId: isIncrease ? null : dto.locationId,
          toLocationId: isIncrease ? dto.locationId : null,
          referenceNumber: dto.referenceNumber,
          performedBy: performedById,
          notes: dto.notes ?? null,
          unitCostPrice: product.costPrice ?? null,
          unitSellingPrice: product.sellingPrice ?? null,
        }),
        manager,
      );
    });
  }

  /**
   * Writes one TRANSFER movement per item and updates two balance rows per item,
   * all inside a single transaction.
   *
   * If externalManager is supplied the caller already opened a transaction and this
   * method participates in it (used by TransfersService.complete). Otherwise a new
   * transaction is opened.
   *
   * Lock ordering: all (productId, locationId) pairs across ALL items are sorted by
   * productId ASC then locationId ASC before acquiring locks — this prevents deadlocks
   * when two concurrent transfers touch overlapping products.
   */
  async recordTransferBatch(
    params: {
      fromLocationId: string;
      toLocationId: string;
      items: Array<{ productId: string; quantity: number }>;
      performedById: string;
      referenceNumber?: string | null;
      notes?: string | null;
    },
    externalManager?: EntityManager,
  ): Promise<InventoryMovement[]> {
    const run = async (
      manager: EntityManager,
    ): Promise<InventoryMovement[]> => {
      const {
        fromLocationId,
        toLocationId,
        items,
        performedById,
        referenceNumber,
        notes,
      } = params;

      // Build the full set of (productId, locationId) lock targets across all items.
      const lockPairs: Array<{ productId: string; locationId: string }> = [];
      for (const item of items) {
        lockPairs.push({
          productId: item.productId,
          locationId: fromLocationId,
        });
        lockPairs.push({ productId: item.productId, locationId: toLocationId });
      }

      // Sort deterministically to prevent deadlocks.
      lockPairs.sort((a, b) => {
        const cmp = a.productId.localeCompare(b.productId);
        return cmp !== 0 ? cmp : a.locationId.localeCompare(b.locationId);
      });

      // Deduplicate.
      const seen = new Set<string>();
      const uniquePairs = lockPairs.filter((p) => {
        const key = `${p.productId}|${p.locationId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Acquire pessimistic write locks in deterministic order.
      for (const pair of uniquePairs) {
        await this.inventoryBalancesService.getOrCreate(
          pair.productId,
          pair.locationId,
          manager,
        );
      }

      // Validate availability at source for ALL items before writing anything.
      const shortages: string[] = [];
      for (const item of items) {
        const balance = await manager.getRepository(InventoryBalance).findOne({
          where: { productId: item.productId, locationId: fromLocationId },
        });
        const available = balance?.quantity ?? 0;
        if (available < item.quantity) {
          shortages.push(
            `Product ${item.productId}: available ${available}, requested ${item.quantity}`,
          );
        }
      }
      if (shortages.length > 0) {
        throw new ConflictException(
          `Insufficient stock: ${shortages.join('; ')}`,
        );
      }

      // Apply all deltas and insert one movement per item.
      const movements: InventoryMovement[] = [];
      for (const item of items) {
        const product = await manager
          .getRepository(Product)
          .findOne({ where: { id: item.productId } });

        await this.inventoryBalancesService.applyDelta(
          item.productId,
          fromLocationId,
          -item.quantity,
          manager,
        );
        await this.inventoryBalancesService.applyDelta(
          item.productId,
          toLocationId,
          item.quantity,
          manager,
        );
        const movement = await this.inventoryMovementsService.create(
          this.buildMovementData({
            productId: item.productId,
            movementType: MovementType.TRANSFER,
            quantity: item.quantity,
            fromLocationId,
            toLocationId,
            referenceNumber: referenceNumber ?? null,
            performedBy: performedById,
            notes: notes ?? null,
            unitCostPrice: product?.costPrice ?? null,
            unitSellingPrice: product?.sellingPrice ?? null,
          }),
          manager,
        );
        movements.push(movement);
      }

      return movements;
    };

    return externalManager
      ? run(externalManager)
      : this.dataSource.transaction(run);
  }

  async reconcileBalances(): Promise<{
    replayedMovements: number;
    rebuiltBalances: number;
    durationMs: number;
  }> {
    const start = Date.now();

    return this.dataSource.transaction(async (manager) => {
      // TRUNCATE acquires ACCESS EXCLUSIVE lock, blocking concurrent balance writes
      // until this transaction commits.
      await manager.query('TRUNCATE TABLE inventory_balances');

      // Load all movements in chronological order for replay.
      // For large datasets, consider batched processing in a future optimisation.
      const movements = await manager
        .getRepository(InventoryMovement)
        .find({ order: { createdAt: 'ASC' } });

      for (const m of movements) {
        if (m.toLocationId) {
          await this.inventoryBalancesService.getOrCreate(
            m.productId,
            m.toLocationId,
            manager,
          );
          await this.inventoryBalancesService.applyDelta(
            m.productId,
            m.toLocationId,
            m.quantity,
            manager,
          );
        }
        if (m.fromLocationId) {
          await this.inventoryBalancesService.getOrCreate(
            m.productId,
            m.fromLocationId,
            manager,
          );
          await this.inventoryBalancesService.applyDelta(
            m.productId,
            m.fromLocationId,
            -m.quantity,
            manager,
          );
        }
      }

      const rebuiltBalances = await manager
        .getRepository(InventoryBalance)
        .count();

      return {
        replayedMovements: movements.length,
        rebuiltBalances,
        durationMs: Date.now() - start,
      };
    });
  }

  // ── private helpers ────────────────────────────────────────────────────────

  private buildMovementData(data: CreateMovementData): CreateMovementData {
    return data;
  }

  private async validateProduct(
    productId: string,
    manager: EntityManager,
  ): Promise<Product> {
    // manager.getRepository respects soft-delete via @DeleteDateColumn automatically.
    const product = await manager
      .getRepository(Product)
      .findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Product ${productId} not found`);
    return product;
  }

  private async validateLocation(
    locationId: string,
    manager: EntityManager,
  ): Promise<Location> {
    const location = await manager
      .getRepository(Location)
      .findOne({ where: { id: locationId } });
    if (!location)
      throw new NotFoundException(`Location ${locationId} not found`);
    return location;
  }
}
