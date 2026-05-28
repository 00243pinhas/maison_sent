import { useQuery } from '@tanstack/react-query';
import { getBalances } from '../api/inventory.api';
import type { BalancesQuery } from '../types';

export function useBalances(query: BalancesQuery) {
  return useQuery({
    queryKey: ['balances', query],
    queryFn: () => getBalances(query),
  });
}
