import { useQuery } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import api from '@/lib/api';
import type { FastMoverItem } from '@/types/api';

export function useTopMovers() {
  const from = subDays(new Date(), 7).toISOString();
  const to = new Date().toISOString();

  return useQuery({
    queryKey: ['reports', 'fast-movers', from],
    queryFn: async () => {
      const { data } = await api.get<FastMoverItem[]>('/reports/fast-movers', {
        params: { from, to, limit: 5 },
      });
      return data;
    },
  });
}
