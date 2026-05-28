import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { LowStockItem } from '@/types/api';

export function useLowestStock() {
  return useQuery({
    queryKey: ['reports', 'low-stock'],
    queryFn: async () => {
      const { data } = await api.get<LowStockItem[]>('/reports/low-stock', {
        params: { minQuantity: 999999 },
      });
      return data.slice(0, 3);
    },
  });
}
