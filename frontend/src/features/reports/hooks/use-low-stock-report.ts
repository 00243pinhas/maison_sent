import { useQuery } from '@tanstack/react-query';
import { getLowStock } from '../api/reports.api';

export function useLowStockReport(minQuantity: number) {
  return useQuery({
    queryKey: ['reports', 'low-stock', minQuantity],
    queryFn: () => getLowStock({ minQuantity }),
  });
}
