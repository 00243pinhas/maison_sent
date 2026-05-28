import { useQuery } from '@tanstack/react-query';
import { getBalance } from '../api/inventory.api';

export function useBalance(productId?: string, locationId?: string) {
  return useQuery({
    queryKey: ['balance', productId, locationId],
    queryFn: () => getBalance(productId!, locationId!),
    enabled: !!productId && !!locationId,
  });
}
