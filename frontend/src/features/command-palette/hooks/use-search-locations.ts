import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Location, PaginatedResponse } from '@/types/api';

export function useSearchLocations(term: string) {
  const { data: locations } = useQuery({
    queryKey: ['palette', 'locations'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Location>>('/locations', {
        params: { limit: 100 },
      });
      return data.data;
    },
    staleTime: 60_000,
  });

  return useMemo(() => {
    if (!locations || term.length < 2) return [];
    const q = term.toLowerCase();
    return locations
      .filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.city ?? '').toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [locations, term]);
}
