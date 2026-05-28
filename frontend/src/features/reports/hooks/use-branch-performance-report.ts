import { useQuery } from '@tanstack/react-query';
import { getBranchPerformance } from '../api/reports.api';
import type { DateRangeParams } from '../api/reports.api';

export function useBranchPerformanceReport(range: DateRangeParams) {
  return useQuery({
    queryKey: ['reports', 'branch-performance', range],
    queryFn: () => getBranchPerformance(range),
    enabled: !!range.from,
  });
}
