import { useQuery } from '@tanstack/react-query';
import { getStockByLocation } from '../api/reports.api';

export function useStockByLocationReport(locationId: string) {
  return useQuery({
    queryKey: ['reports', 'stock-by-location', locationId],
    queryFn: () => getStockByLocation(locationId),
    enabled: !!locationId,
  });
}
