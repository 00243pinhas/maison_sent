import { useQuery } from '@tanstack/react-query';
import { getMovementAudit } from '../api/reports.api';
import type { DateRangeParams } from '../api/reports.api';

export function useMovementAuditReport(
  range: DateRangeParams,
  movementType: string,
  page: number,
  limit: number,
) {
  return useQuery({
    queryKey: ['reports', 'movement-audit', range, movementType, page],
    queryFn: () =>
      getMovementAudit({ ...range, movementType: movementType || undefined, page, limit }),
    placeholderData: (prev) => prev,
  });
}
