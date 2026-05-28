import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MovementType } from '../../common/enums/movement-type.enum';
import { AuditQueryDto } from './dto/audit-query.dto';
import { DateRangeQueryDto } from './dto/date-range-query.dto';
import { DeadStockQueryDto } from './dto/dead-stock-query.dto';
import { SalesByPeriodQueryDto } from './dto/sales-by-period-query.dto';
import { StockByLocationQueryDto } from './dto/stock-by-location-query.dto';
import { TopNQueryDto } from './dto/top-n-query.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  // ── 1. Stock summary — per-product total quantity + value at current prices ──

  async stockSummary() {
    return this.dataSource
      .createQueryBuilder()
      .select('p.id', 'productId')
      .addSelect('p.name', 'productName')
      .addSelect('p.sku', 'sku')
      .addSelect('COALESCE(SUM(ib.quantity), 0)', 'totalQuantity')
      .addSelect(
        'COALESCE(SUM(ib.quantity), 0) * p.cost_price',
        'totalCostValue',
      )
      .addSelect(
        'COALESCE(SUM(ib.quantity), 0) * p.selling_price',
        'totalSellingValue',
      )
      .from('products', 'p')
      .leftJoin('inventory_balances', 'ib', 'ib.product_id = p.id')
      .where('p.deleted_at IS NULL')
      .groupBy('p.id')
      .addGroupBy('p.name')
      .addGroupBy('p.sku')
      .addGroupBy('p.cost_price')
      .addGroupBy('p.selling_price')
      .orderBy('totalQuantity', 'DESC')
      .getRawMany();
  }

  // ── 2. Stock by location — quantity per product per location ─────────────────

  async stockByLocation(query: StockByLocationQueryDto) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('l.id', 'locationId')
      .addSelect('l.name', 'locationName')
      .addSelect('l.type', 'locationType')
      .addSelect('p.id', 'productId')
      .addSelect('p.name', 'productName')
      .addSelect('p.sku', 'sku')
      .addSelect('ib.quantity', 'quantity')
      .addSelect('ib.quantity * p.cost_price', 'costValue')
      .addSelect('ib.quantity * p.selling_price', 'sellingValue')
      .from('inventory_balances', 'ib')
      .innerJoin('locations', 'l', 'l.id = ib.location_id')
      .innerJoin('products', 'p', 'p.id = ib.product_id')
      .where('l.deleted_at IS NULL')
      .andWhere('p.deleted_at IS NULL')
      .andWhere('ib.quantity > 0');

    if (query.locationId) {
      qb.andWhere('l.id = :locationId', { locationId: query.locationId });
    }

    return qb.orderBy('l.name').addOrderBy('p.name').getRawMany();
  }

  // ── 3. Inventory value — total value across all locations ────────────────────

  async inventoryValue(): Promise<unknown> {
    return this.dataSource
      .createQueryBuilder()
      .select('SUM(ib.quantity * p.cost_price)', 'totalCostValue')
      .addSelect('SUM(ib.quantity * p.selling_price)', 'totalSellingValue')
      .addSelect('SUM(ib.quantity)', 'totalUnits')
      .addSelect('COUNT(DISTINCT p.id)', 'distinctProducts')
      .addSelect('COUNT(DISTINCT ib.location_id)', 'distinctLocations')
      .from('inventory_balances', 'ib')
      .innerJoin('products', 'p', 'p.id = ib.product_id')
      .where('p.deleted_at IS NULL')
      .getRawOne();
  }

  // ── 4. Low stock — products below a min quantity threshold ───────────────────

  async lowStock(minQuantity: number) {
    return this.dataSource
      .createQueryBuilder()
      .select('p.id', 'productId')
      .addSelect('p.name', 'productName')
      .addSelect('p.sku', 'sku')
      .addSelect('l.id', 'locationId')
      .addSelect('l.name', 'locationName')
      .addSelect('ib.quantity', 'quantity')
      .from('inventory_balances', 'ib')
      .innerJoin('products', 'p', 'p.id = ib.product_id')
      .innerJoin('locations', 'l', 'l.id = ib.location_id')
      .where('p.deleted_at IS NULL')
      .andWhere('l.deleted_at IS NULL')
      .andWhere('ib.quantity <= :minQuantity', { minQuantity })
      .orderBy('ib.quantity', 'ASC')
      .addOrderBy('p.name', 'ASC')
      .getRawMany();
  }

  // ── 5. Dead stock — products with no outbound movement in N days ─────────────

  async deadStock(query: DeadStockQueryDto) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (query.days ?? 90));

    return this.dataSource
      .createQueryBuilder()
      .select('p.id', 'productId')
      .addSelect('p.name', 'productName')
      .addSelect('p.sku', 'sku')
      .addSelect('p.brand', 'brand')
      .addSelect('COALESCE(SUM(ib.quantity), 0)', 'currentQuantity')
      .addSelect(
        'COALESCE(SUM(ib.quantity), 0) * p.cost_price',
        'currentCostValue',
      )
      .addSelect(
        'CASE WHEN MAX(last_move.last_outbound) IS NOT NULL THEN EXTRACT(DAY FROM (NOW() - MAX(last_move.last_outbound)))::int ELSE NULL END',
        'daysSinceLastSale',
      )
      .from('products', 'p')
      .leftJoin('inventory_balances', 'ib', 'ib.product_id = p.id')
      .leftJoin(
        (qb) =>
          qb
            .select('im.product_id', 'product_id')
            .addSelect('MAX(im.created_at)', 'last_outbound')
            .from('inventory_movements', 'im')
            .where('im.from_location_id IS NOT NULL')
            .groupBy('im.product_id'),
        'last_move',
        'last_move.product_id = p.id',
      )
      .where('p.deleted_at IS NULL')
      .andWhere(
        '(last_move.last_outbound IS NULL OR last_move.last_outbound < :cutoff)',
        { cutoff },
      )
      .groupBy('p.id')
      .addGroupBy('p.name')
      .addGroupBy('p.sku')
      .addGroupBy('p.brand')
      .addGroupBy('p.cost_price')
      .orderBy('currentQuantity', 'DESC')
      .getRawMany();
  }

  // ── 6. Fast movers — top N products by units sold in period ─────────────────

  async fastMovers(query: TopNQueryDto) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('p.id', 'productId')
      .addSelect('p.name', 'productName')
      .addSelect('p.sku', 'sku')
      .addSelect('SUM(im.quantity)', 'unitsSold')
      .addSelect('SUM(im.quantity * im.unit_selling_price)', 'totalRevenue')
      .from('inventory_movements', 'im')
      .innerJoin('products', 'p', 'p.id = im.product_id')
      .where('im.movement_type = :type', { type: MovementType.SALE })
      .andWhere('p.deleted_at IS NULL');

    if (query.from) qb.andWhere('im.created_at >= :from', { from: query.from });
    if (query.to) qb.andWhere('im.created_at <= :to', { to: query.to });

    return qb
      .groupBy('p.id')
      .addGroupBy('p.name')
      .addGroupBy('p.sku')
      .orderBy('unitsSold', 'DESC')
      .limit(query.limit ?? 10)
      .getRawMany();
  }

  // ── 7. Sales by period — SALE movements grouped by day/week/month ────────────

  async salesByPeriod(query: SalesByPeriodQueryDto) {
    const trunc = `DATE_TRUNC('${query.interval}', im.created_at)`;

    const qb = this.dataSource
      .createQueryBuilder()
      .select(trunc, 'period')
      .addSelect('COUNT(*)', 'transactionCount')
      .addSelect('SUM(im.quantity)', 'unitsSold')
      .addSelect('SUM(im.quantity * im.unit_selling_price)', 'totalRevenue')
      .addSelect('SUM(im.quantity * im.unit_cost_price)', 'totalCost')
      .from('inventory_movements', 'im')
      .where('im.movement_type = :type', { type: MovementType.SALE });

    if (query.from) qb.andWhere('im.created_at >= :from', { from: query.from });
    if (query.to) qb.andWhere('im.created_at <= :to', { to: query.to });

    return qb.groupBy(trunc).orderBy('period', 'ASC').getRawMany();
  }

  // ── 8. Revenue summary — total revenue and COGS in period ───────────────────

  async revenueSummary(query: DateRangeQueryDto) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select(
        `SUM(CASE WHEN im.movement_type = '${MovementType.SALE}' THEN im.quantity * im.unit_selling_price ELSE 0 END)`,
        'totalRevenue',
      )
      .addSelect(
        `SUM(CASE WHEN im.movement_type = '${MovementType.SALE}' THEN im.quantity * im.unit_cost_price ELSE 0 END)`,
        'totalCOGS',
      )
      .addSelect(
        `SUM(CASE WHEN im.movement_type = '${MovementType.SALE}' THEN im.quantity ELSE 0 END)`,
        'unitsSold',
      )
      .addSelect(
        `SUM(CASE WHEN im.movement_type = '${MovementType.RECEIVED}' THEN im.quantity * im.unit_cost_price ELSE 0 END)`,
        'totalPurchaseCost',
      )
      .addSelect(
        `SUM(CASE WHEN im.movement_type = '${MovementType.RECEIVED}' THEN im.quantity ELSE 0 END)`,
        'unitsReceived',
      )
      .from('inventory_movements', 'im')
      .where('1=1');

    if (query.from) qb.andWhere('im.created_at >= :from', { from: query.from });
    if (query.to) qb.andWhere('im.created_at <= :to', { to: query.to });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return qb.getRawOne();
  }

  // ── 9. Branch performance — sales revenue and units per location ─────────────

  async branchPerformance(query: DateRangeQueryDto) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('l.id', 'locationId')
      .addSelect('l.name', 'locationName')
      .addSelect('l.type', 'locationType')
      .addSelect('COUNT(im.id)', 'salesTransactions')
      .addSelect('COALESCE(SUM(im.quantity), 0)', 'unitsSold')
      .addSelect(
        'COALESCE(SUM(im.quantity * im.unit_selling_price), 0)',
        'totalRevenue',
      )
      .addSelect(
        'COALESCE(SUM(im.quantity * im.unit_cost_price), 0)',
        'totalCost',
      )
      .from('locations', 'l')
      .leftJoin(
        'inventory_movements',
        'im',
        `im.from_location_id = l.id AND im.movement_type = '${MovementType.SALE}'`,
      )
      .where('l.deleted_at IS NULL');

    if (query.from)
      qb.andWhere('(im.created_at >= :from OR im.created_at IS NULL)', {
        from: query.from,
      });
    if (query.to)
      qb.andWhere('(im.created_at <= :to OR im.created_at IS NULL)', {
        to: query.to,
      });

    return qb
      .groupBy('l.id')
      .addGroupBy('l.name')
      .addGroupBy('l.type')
      .orderBy('totalRevenue', 'DESC')
      .getRawMany();
  }

  // ── 10. Movement audit — paginated movement log with filters ─────────────────

  async movementAudit(query: AuditQueryDto) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('im.id', 'id')
      .addSelect('im.movement_type', 'movementType')
      .addSelect('im.quantity', 'quantity')
      .addSelect('im.unit_cost_price', 'unitCostPrice')
      .addSelect('im.unit_selling_price', 'unitSellingPrice')
      .addSelect('im.reference_number', 'referenceNumber')
      .addSelect('im.notes', 'notes')
      .addSelect('im.created_at', 'createdAt')
      .addSelect('p.id', 'productId')
      .addSelect('p.name', 'productName')
      .addSelect('p.sku', 'sku')
      .addSelect('fl.name', 'fromLocationName')
      .addSelect('tl.name', 'toLocationName')
      .addSelect('u.email', 'performedByEmail')
      .from('inventory_movements', 'im')
      .innerJoin('products', 'p', 'p.id = im.product_id')
      .leftJoin('locations', 'fl', 'fl.id = im.from_location_id')
      .leftJoin('locations', 'tl', 'tl.id = im.to_location_id')
      .innerJoin('users', 'u', 'u.id = im.performed_by')
      .where('p.deleted_at IS NULL');

    if (query.productId)
      qb.andWhere('im.product_id = :productId', {
        productId: query.productId,
      });
    if (query.locationId)
      qb.andWhere(
        '(im.from_location_id = :locationId OR im.to_location_id = :locationId)',
        { locationId: query.locationId },
      );
    if (query.performedBy)
      qb.andWhere('im.performed_by = :performedBy', {
        performedBy: query.performedBy,
      });
    if (query.movementType)
      qb.andWhere('im.movement_type = :movementType', {
        movementType: query.movementType,
      });
    if (query.from) qb.andWhere('im.created_at >= :from', { from: query.from });
    if (query.to) qb.andWhere('im.created_at <= :to', { to: query.to });

    return qb.orderBy('im.created_at', 'DESC').limit(500).getRawMany();
  }

  // ── 11. Movement summary — count and quantity by type in period ──────────────

  async movementSummary(query: DateRangeQueryDto) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('im.movement_type', 'movementType')
      .addSelect('COUNT(*)', 'transactionCount')
      .addSelect('SUM(im.quantity)', 'totalQuantity')
      .from('inventory_movements', 'im')
      .where('1=1');

    if (query.from) qb.andWhere('im.created_at >= :from', { from: query.from });
    if (query.to) qb.andWhere('im.created_at <= :to', { to: query.to });

    return qb
      .groupBy('im.movement_type')
      .orderBy('transactionCount', 'DESC')
      .getRawMany();
  }

  // ── 12. Transfer report — completed transfers summary by period ──────────────

  async transferReport(query: DateRangeQueryDto) {
    const qb = this.dataSource
      .createQueryBuilder()
      .select('fl.id', 'fromLocationId')
      .addSelect('fl.name', 'fromLocationName')
      .addSelect('tl.id', 'toLocationId')
      .addSelect('tl.name', 'toLocationName')
      .addSelect('COUNT(t.id)', 'transferCount')
      .addSelect('SUM(ti_agg.item_count)', 'totalLineItems')
      .addSelect('SUM(ti_agg.total_qty)', 'totalQuantity')
      .from('transfers', 't')
      .innerJoin('locations', 'fl', 'fl.id = t.from_location_id')
      .innerJoin('locations', 'tl', 'tl.id = t.to_location_id')
      .leftJoin(
        (qb) =>
          qb
            .select('ti.transfer_id', 'transfer_id')
            .addSelect('COUNT(*)', 'item_count')
            .addSelect('SUM(ti.quantity)', 'total_qty')
            .from('transfer_items', 'ti')
            .groupBy('ti.transfer_id'),
        'ti_agg',
        'ti_agg.transfer_id = t.id',
      )
      .where("t.status = 'COMPLETED'")
      .andWhere('t.deleted_at IS NULL');

    if (query.from)
      qb.andWhere('t.completed_at >= :from', { from: query.from });
    if (query.to) qb.andWhere('t.completed_at <= :to', { to: query.to });

    return qb
      .groupBy('fl.id')
      .addGroupBy('fl.name')
      .addGroupBy('tl.id')
      .addGroupBy('tl.name')
      .orderBy('transferCount', 'DESC')
      .getRawMany();
  }
}
