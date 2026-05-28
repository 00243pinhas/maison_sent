import { useQuery } from '@tanstack/react-query';
import { getMovements } from '../api/inventory.api';
import type { MovementsQuery } from '../types';

export function useMovements(query: MovementsQuery) {
  return useQuery({
    queryKey: ['movements', query],
    queryFn: () => getMovements(query),
  });
}
