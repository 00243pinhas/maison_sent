import { useQuery } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import {
  getInventoryValue,
  getMovementSummary,
  getFastMovers,
  getBranchPerformance,
  getMovementAudit,
  getLowStock,
  type DateRangeParams,
} from '../api/reports.api';

export type DatePreset = '7d' | '30d' | '90d' | '365d';

export function getDateRange(preset: DatePreset): DateRangeParams {
  const days = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 }[preset];
  return {
    from: subDays(new Date(), days).toISOString(),
    to: new Date().toISOString(),
  };
}

export function useReportInventoryValue() {
  return useQuery({
    queryKey: ['reports', 'inventory-value'],
    queryFn: getInventoryValue,
  });
}

export function useReportMovementSummary(preset: DatePreset) {
  const range = getDateRange(preset);
  return useQuery({
    queryKey: ['reports', 'movement-summary', preset],
    queryFn: () => getMovementSummary(range),
  });
}

export function useReportFastMovers(preset: DatePreset) {
  const range = getDateRange(preset);
  return useQuery({
    queryKey: ['reports', 'fast-movers', preset],
    queryFn: () => getFastMovers({ ...range, limit: 50 }),
  });
}

export function useReportBranchPerformance(preset: DatePreset) {
  const range = getDateRange(preset);
  return useQuery({
    queryKey: ['reports', 'branch-performance', preset],
    queryFn: () => getBranchPerformance(range),
  });
}

export function useReportAudit(preset: DatePreset) {
  const range = getDateRange(preset);
  return useQuery({
    queryKey: ['reports', 'audit', preset],
    queryFn: () => getMovementAudit({ ...range, limit: 200 }),
  });
}

export function useReportLowStock() {
  return useQuery({
    queryKey: ['reports', 'low-stock'],
    queryFn: () => getLowStock({}),
  });
}
