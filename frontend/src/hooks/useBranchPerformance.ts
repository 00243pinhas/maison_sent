import { useQuery } from '@tanstack/react-query';
import { startOfMonth } from 'date-fns';
import api from '@/lib/api';
import type { BranchPerformanceItem } from '@/types/api';

export function useBranchPerformance() {
  const from = startOfMonth(new Date()).toISOString();

  return useQuery({
    queryKey: ['reports', 'branch-performance', from],
    queryFn: async () => {
      const { data } = await api.get<BranchPerformanceItem[]>('/reports/branch-performance', {
        params: { from },
      });
      return data;
    },
  });
}
