import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Product, PaginatedResponse } from '@/types/api';

export function useSearchProducts(term: string) {
  return useQuery({
    queryKey: ['palette', 'products', term],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Product>>('/products', {
        params: { search: term, limit: 8 },
      });
      return data.data;
    },
    enabled: term.length >= 2,
    staleTime: 30_000,
  });
}
