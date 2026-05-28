import { useQuery } from '@tanstack/react-query';
import { getSuppliers } from '../api/suppliers.api';

export function useSuppliers(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => getSuppliers(params),
  });
}
