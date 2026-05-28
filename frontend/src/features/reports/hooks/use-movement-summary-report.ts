import { useQuery } from '@tanstack/react-query';
import { getMovementSummary } from '../api/reports.api';
import type { DateRangeParams } from '../api/reports.api';

export function useMovementSummaryReport(range: DateRangeParams) {
  return useQuery({
    queryKey: ['reports', 'movement-summary', range],
    queryFn: () => getMovementSummary(range),
    enabled: !!range.from,
  });
}
