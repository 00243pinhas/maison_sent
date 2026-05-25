import {
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

  async receiveStock(dto: ReceiveStockDto, performedById: string): Promise<InventoryMovement> {
    return this.dataSource.transaction(async (manager) => {
      await this.validateProduct(dto.productId, manager);
      await this.validateLocation(dto.toLocationId, manager);

      await this.inventoryBalancesService.getOrCreate(dto.productId, dto.toLocationId, manager);
      await this.inventoryBalancesService.applyDelta(dto.productId, dto.toLocationId, dto.quantity, manager);

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
        }),
        manager,
      );
    });
  }

  async recordSale(dto: RecordSaleDto, performedById: string): Promise<InventoryMovement> {
    return this.dataSource.transaction(async (manager) => {
      await this.validateProduct(dto.productId, manager);
      await this.validateLocation(dto.fromLocationId, manager);

      await this.inventoryBalancesService.getOrCreate(dto.productId, dto.fromLocationId, manager);
      await this.inventoryBalancesService.applyDelta(dto.productId, dto.fromLocationId, -dto.quantity, manager);

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
        }),
        manager,
      );
    });
  }

  async recordReturn(dto: RecordReturnDto, performedById: string): Promise<InventoryMovement> {
    return this.dataSource.transaction(async (manager) => {
      await this.validateProduct(dto.productId, manager);
      await this.validateLocation(dto.toLocationId, manager);

      await this.inventoryBalancesService.getOrCreate(dto.productId, dto.toLocationId, manager);
      await this.inventoryBalancesService.applyDelta(dto.productId, dto.toLocationId, dto.quantity, manager);

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
        }),
        manager,
      );
    });
  }

  async recordDamage(dto: RecordDamageDto, performedById: string): Promise<InventoryMovement> {
    return this.dataSource.transaction(async (manager) => {
      await this.validateProduct(dto.productId, manager);
      await this.validateLocation(dto.fromLocationId, manager);

      await this.inventoryBalancesService.getOrCreate(dto.productId, dto.fromLocationId, manager);
      await this.inventoryBalancesService.applyDelta(dto.productId, dto.fromLocationId, -dto.quantity, manager);

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
        }),
        manager,
      );
    });
  }

  async adjustStock(dto: AdjustStockDto, performedById: string): Promise<InventoryMovement> {
    const isIncrease = dto.direction === AdjustDirection.INCREASE;
    const movementType = isIncrease ? MovementType.ADJUSTMENT_IN : MovementType.ADJUSTMENT_OUT;
    const delta = isIncrease ? dto.quantity : -dto.quantity;

    return this.dataSource.transaction(async (manager) => {
      await this.validateProduct(dto.productId, manager);
      await this.validateLocation(dto.locationId, manager);

      await this.inventoryBalancesService.getOrCreate(dto.productId, dto.locationId, manager);
      await this.inventoryBalancesService.applyDelta(dto.productId, dto.locationId, delta, manager);

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
        }),
        manager,
      );
    });
  }

  // PHASE 4 — not exposed via controller; the transfers module will call this.
  async recordTransfer(
    productId: string,
    fromLocationId: string,
    toLocationId: string,
    quantity: number,
    referenceNumber: string | null,
    notes: string | null,
    performedById: string,
  ): Promise<InventoryMovement> {
    return this.dataSource.transaction(async (manager) => {
      await this.validateProduct(productId, manager);
      await this.validateLocation(fromLocationId, manager);
      await this.validateLocation(toLocationId, manager);

      // Lock balance rows in deterministic UUID order to prevent deadlocks.
      const [firstId, secondId] = [fromLocationId, toLocationId].sort();
      const firstIsFrom = firstId === fromLocationId;

      if (firstIsFrom) {
        await this.inventoryBalancesService.getOrCreate(productId, fromLocationId, manager);
        await this.inventoryBalancesService.getOrCreate(productId, toLocationId, manager);
      } else {
        await this.inventoryBalancesService.getOrCreate(productId, toLocationId, manager);
        await this.inventoryBalancesService.getOrCreate(productId, fromLocationId, manager);
      }

      await this.inventoryBalancesService.applyDelta(productId, fromLocationId, -quantity, manager);
      await this.inventoryBalancesService.applyDelta(productId, toLocationId, quantity, manager);

      return this.inventoryMovementsService.create(
        this.buildMovementData({
          productId,
          movementType: MovementType.TRANSFER,
          quantity,
          fromLocationId,
          toLocationId,
          referenceNumber,
          performedBy: performedById,
          notes,
        }),
        manager,
      );
    });
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
          await this.inventoryBalancesService.getOrCreate(m.productId, m.toLocationId, manager);
          await this.inventoryBalancesService.applyDelta(m.productId, m.toLocationId, m.quantity, manager);
        }
        if (m.fromLocationId) {
          await this.inventoryBalancesService.getOrCreate(m.productId, m.fromLocationId, manager);
          await this.inventoryBalancesService.applyDelta(m.productId, m.fromLocationId, -m.quantity, manager);
        }
      }

      const rebuiltBalances = await manager.getRepository(InventoryBalance).count();

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

  private async validateProduct(productId: string, manager: EntityManager): Promise<Product> {
    // manager.getRepository respects soft-delete via @DeleteDateColumn automatically.
    const product = await manager.getRepository(Product).findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Product ${productId} not found`);
    return product;
  }

  private async validateLocation(locationId: string, manager: EntityManager): Promise<Location> {
    const location = await manager.getRepository(Location).findOne({ where: { id: locationId } });
    if (!location) throw new NotFoundException(`Location ${locationId} not found`);
    return location;
  }
}
