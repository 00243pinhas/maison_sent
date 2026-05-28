import { useQuery } from '@tanstack/react-query';
import { getTransfer } from '../api/transfers.api';

export function useTransfer(id: string) {
  return useQuery({
    queryKey: ['transfer', id],
    queryFn: () => getTransfer(id),
    enabled: !!id,
  });
}
