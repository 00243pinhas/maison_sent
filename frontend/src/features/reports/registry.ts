import type { ComponentType } from 'react';
import type { RoleName } from '@/types/api';
import { StockSummaryReport } from './reports/stock-summary';
import { InventoryValueReport } from './reports/inventory-value';
import { LowStockReport } from './reports/low-stock';
import { DeadStockReport } from './reports/dead-stock';
import { StockByLocationReport } from './reports/stock-by-location';
import { FastMoversReport } from './reports/fast-movers';
import { RevenueSummaryReport } from './reports/revenue-summary';
import { BranchPerformanceReport } from './reports/branch-performance';
import { SalesByPeriodReport } from './reports/sales-by-period';
import { MovementSummaryReport } from './reports/movement-summary';
import { MovementAuditReport } from './reports/movement-audit';
import { TransferReport } from './reports/transfer-report';

export type ReportGroup = 'Stock' | 'Sales' | 'Audit' | 'Workflow';

export interface ReportDefinition {
  slug: string;
  label: string;
  group: ReportGroup;
  allowedRoles: RoleName[] | 'ALL_AUTH';
  Component: ComponentType;
}

export const REPORTS: ReportDefinition[] = [
  {
    slug: 'stock-summary',
    label: 'Stock Summary',
    group: 'Stock',
    allowedRoles: 'ALL_AUTH',
    Component: StockSummaryReport,
  },
  {
    slug: 'inventory-value',
    label: 'Inventory Value',
    group: 'Stock',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_MANAGER'],
    Component: InventoryValueReport,
  },
  {
    slug: 'low-stock',
    label: 'Low Stock',
    group: 'Stock',
    allowedRoles: 'ALL_AUTH',
    Component: LowStockReport,
  },
  {
    slug: 'dead-stock',
    label: 'Dead Stock',
    group: 'Stock',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_MANAGER'],
    Component: DeadStockReport,
  },
  {
    slug: 'stock-by-location',
    label: 'Stock by Location',
    group: 'Stock',
    allowedRoles: 'ALL_AUTH',
    Component: StockByLocationReport,
  },
  {
    slug: 'fast-movers',
    label: 'Fast Movers',
    group: 'Sales',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER'],
    Component: FastMoversReport,
  },
  {
    slug: 'revenue-summary',
    label: 'Revenue Summary',
    group: 'Sales',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
    Component: RevenueSummaryReport,
  },
  {
    slug: 'branch-performance',
    label: 'Branch Performance',
    group: 'Sales',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
    Component: BranchPerformanceReport,
  },
  {
    slug: 'sales-by-period',
    label: 'Sales by Period',
    group: 'Sales',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER'],
    Component: SalesByPeriodReport,
  },
  {
    slug: 'movement-summary',
    label: 'Movement Summary',
    group: 'Audit',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_MANAGER'],
    Component: MovementSummaryReport,
  },
  {
    slug: 'movement-audit',
    label: 'Movement Audit',
    group: 'Audit',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_MANAGER'],
    Component: MovementAuditReport,
  },
  {
    slug: 'transfer-report',
    label: 'Transfer Report',
    group: 'Workflow',
    allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_MANAGER'],
    Component: TransferReport,
  },
];

export const REPORT_GROUPS: ReportGroup[] = ['Stock', 'Sales', 'Audit', 'Workflow'];

export function getReport(slug: string): ReportDefinition | undefined {
  return REPORTS.find((r) => r.slug === slug);
}
