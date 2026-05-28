import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { PaginatedResponse, Movement } from '@/types/api';

export function useRecentActivity() {
  return useQuery({
    queryKey: ['inventory', 'movements', 'recent'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Movement>>('/inventory/movements', {
        params: { limit: 8, page: 1 },
      });
      return data.data;
    },
  });
}
