import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { InventoryValueReport } from '@/types/api';

export function useInventoryValue() {
  return useQuery({
    queryKey: ['reports', 'inventory-value'],
    queryFn: async () => {
      const { data } = await api.get<InventoryValueReport>('/reports/inventory-value');
      return data;
    },
  });
}
