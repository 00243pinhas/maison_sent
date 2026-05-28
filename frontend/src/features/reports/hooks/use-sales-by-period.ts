import { useQuery } from '@tanstack/react-query';
import { getSalesByPeriod } from '../api/reports.api';
import type { DateRangeParams } from '../api/reports.api';

export function useSalesByPeriodReport(range: DateRangeParams, interval: string) {
  return useQuery({
    queryKey: ['reports', 'sales-by-period', range, interval],
    queryFn: () => getSalesByPeriod({ ...range, interval }),
    enabled: !!range.from,
  });
}
