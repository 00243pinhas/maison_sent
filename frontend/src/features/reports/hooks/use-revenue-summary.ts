import { useQuery } from '@tanstack/react-query';
import { getRevenueSummary } from '../api/reports.api';
import type { DateRangeParams } from '../api/reports.api';

export function useRevenueSummaryReport(range: DateRangeParams) {
  return useQuery({
    queryKey: ['reports', 'revenue-summary', range],
    queryFn: () => getRevenueSummary(range),
    enabled: !!range.from,
  });
}
