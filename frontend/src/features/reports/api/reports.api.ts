import api from '@/lib/api';
import type {
  InventoryValueReport,
  MovementSummaryItem,
  FastMoverItem,
  BranchPerformanceItem,
  AuditMovement,
  LowStockItem,
  StockSummaryReport,
  StockByLocationItem,
  DeadStockItem,
  SalesByPeriodItem,
  RevenueSummaryReport,
  TransferReportStats,
} from '@/types/api';

export interface DateRangeParams {
  from?: string;
  to?: string;
}

export async function getStockSummary(): Promise<StockSummaryReport> {
  const { data } = await api.get<StockSummaryReport>('/reports/stock-summary');
  return data;
}

export async function getStockByLocation(locationId: string): Promise<StockByLocationItem[]> {
  const { data } = await api.get<StockByLocationItem[]>('/reports/stock-by-location', {
    params: { locationId },
  });
  return data;
}

export async function getInventoryValue(): Promise<InventoryValueReport> {
  const { data } = await api.get<InventoryValueReport>('/reports/inventory-value');
  return data;
}

export async function getLowStock(params: { minQuantity?: number; page?: number; limit?: number }): Promise<LowStockItem[]> {
  const { data } = await api.get<LowStockItem[]>('/reports/low-stock', { params });
  return data;
}

export async function getDeadStock(days: number): Promise<DeadStockItem[]> {
  const { data } = await api.get<DeadStockItem[]>('/reports/dead-stock', { params: { days } });
  return data;
}

export async function getFastMovers(
  params: DateRangeParams & { limit?: number },
): Promise<FastMoverItem[]> {
  const { data } = await api.get<FastMoverItem[]>('/reports/fast-movers', { params });
  return data;
}

export async function getSalesByPeriod(
  params: DateRangeParams & { interval?: string },
): Promise<SalesByPeriodItem[]> {
  const { data } = await api.get<SalesByPeriodItem[]>('/reports/sales-by-period', { params });
  return data;
}

export async function getRevenueSummary(params: DateRangeParams): Promise<RevenueSummaryReport> {
  const { data } = await api.get<RevenueSummaryReport>('/reports/revenue-summary', { params });
  return data;
}

export async function getBranchPerformance(params: DateRangeParams): Promise<BranchPerformanceItem[]> {
  const { data } = await api.get<BranchPerformanceItem[]>('/reports/branch-performance', { params });
  return data;
}

export async function getMovementAudit(
  params: DateRangeParams & { movementType?: string; page?: number; limit?: number },
): Promise<AuditMovement[]> {
  const { data } = await api.get<AuditMovement[]>('/reports/movement-audit', { params });
  return data;
}

export async function getMovementSummary(params: DateRangeParams): Promise<MovementSummaryItem[]> {
  const { data } = await api.get<MovementSummaryItem[]>('/reports/movement-summary', { params });
  return data;
}

export async function getTransferReport(params: DateRangeParams): Promise<TransferReportStats> {
  const { data } = await api.get<TransferReportStats>('/reports/transfer-report', { params });
  return data;
}
