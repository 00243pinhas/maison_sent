import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../api/categories.api';

export function useCategories(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => getCategories(params),
  });
}
