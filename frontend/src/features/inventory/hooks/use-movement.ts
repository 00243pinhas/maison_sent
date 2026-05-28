import { useQuery } from '@tanstack/react-query';
import { getMovement } from '../api/inventory.api';

export function useMovement(id: string | null) {
  return useQuery({
    queryKey: ['movement', id],
    queryFn: () => getMovement(id!),
    enabled: !!id,
  });
}
