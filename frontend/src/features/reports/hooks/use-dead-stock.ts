import { useQuery } from '@tanstack/react-query';
import { getDeadStock } from '../api/reports.api';

export function useDeadStockReport(days: number) {
  return useQuery({
    queryKey: ['reports', 'dead-stock', days],
    queryFn: () => getDeadStock(days),
  });
}
