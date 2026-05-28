import { useQuery } from '@tanstack/react-query';
import { getStockSummary } from '../api/reports.api';

export function useStockSummaryReport() {
  return useQuery({ queryKey: ['reports', 'stock-summary'], queryFn: getStockSummary });
}
