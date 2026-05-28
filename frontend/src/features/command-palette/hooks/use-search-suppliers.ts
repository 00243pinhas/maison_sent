import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Supplier, PaginatedResponse } from '@/types/api';

export function useSearchSuppliers(term: string) {
  const { data: suppliers } = useQuery({
    queryKey: ['palette', 'suppliers'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Supplier>>('/suppliers', {
        params: { limit: 100 },
      });
      return data.data;
    },
    staleTime: 60_000,
  });

  return useMemo(() => {
    if (!suppliers || term.length < 2) return [];
    const q = term.toLowerCase();
    return suppliers
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.country ?? '').toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [suppliers, term]);
}
