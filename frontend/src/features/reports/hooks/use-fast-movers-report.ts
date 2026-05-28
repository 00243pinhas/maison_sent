import { useQuery } from '@tanstack/react-query';
import { getFastMovers } from '../api/reports.api';
import type { DateRangeParams } from '../api/reports.api';

export function useFastMoversReport(range: DateRangeParams, limit: number) {
  return useQuery({
    queryKey: ['reports', 'fast-movers', range, limit],
    queryFn: () => getFastMovers({ ...range, limit }),
  });
}
