import { useQuery } from '@tanstack/react-query';
import { getLocations } from '../api/locations.api';

export function useLocations(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['locations', params],
    queryFn: () => getLocations(params),
  });
}
