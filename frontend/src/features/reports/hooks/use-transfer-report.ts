import { useQuery } from '@tanstack/react-query';
import { getTransferReport } from '../api/reports.api';
import type { DateRangeParams } from '../api/reports.api';

export function useTransferReport(range: DateRangeParams) {
  return useQuery({
    queryKey: ['reports', 'transfer-report', range],
    queryFn: () => getTransferReport(range),
    enabled: !!range.from,
  });
}
