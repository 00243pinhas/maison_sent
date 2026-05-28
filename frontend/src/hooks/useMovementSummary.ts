import { useQuery } from '@tanstack/react-query';
import { subDays } from 'date-fns';
import api from '@/lib/api';
import type { MovementSummaryItem } from '@/types/api';

export function useMovementSummary() {
  const from = subDays(new Date(), 30).toISOString();

  return useQuery({
    queryKey: ['reports', 'movement-summary', from],
    queryFn: async () => {
      const { data } = await api.get<MovementSummaryItem[]>('/reports/movement-summary', {
        params: { from },
      });
      return data;
    },
  });
}
