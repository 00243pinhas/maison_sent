import { useQuery } from '@tanstack/react-query';
import { getTransfers } from '../api/transfers.api';
import type { TransfersQuery } from '../types';

export function useTransfers(query: TransfersQuery) {
  return useQuery({
    queryKey: ['transfers', query],
    queryFn: () => getTransfers(query),
    placeholderData: (prev) => prev,
  });
}
