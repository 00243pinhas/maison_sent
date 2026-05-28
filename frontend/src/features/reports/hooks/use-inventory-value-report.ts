import { useQuery } from '@tanstack/react-query';
import { getInventoryValue } from '../api/reports.api';

export function useInventoryValueReport() {
  return useQuery({ queryKey: ['reports', 'inventory-value'], queryFn: getInventoryValue });
}
