import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Transfer, PaginatedResponse } from '@/types/api';

export function useSearchTransfers(term: string) {
  const { data: transfers } = useQuery({
    queryKey: ['palette', 'transfers'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Transfer>>('/transfers', {
        params: { limit: 20 },
      });
      return data.data;
    },
    staleTime: 30_000,
  });

  return useMemo(() => {
    if (!transfers || term.length < 2) return [];
    const q = term.toLowerCase();
    return transfers.filter(
      (t) =>
        (t.referenceNumber ?? '').toLowerCase().includes(q) ||
        t.fromLocation.name.toLowerCase().includes(q) ||
        t.toLocation.name.toLowerCase().includes(q),
    );
  }, [transfers, term]);
}
