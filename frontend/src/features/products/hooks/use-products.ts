import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/products.api';
import type { ProductQuery } from '../api/products.api';

export function useProducts(query: ProductQuery) {
  return useQuery({
    queryKey: ['products', query],
    queryFn: () => getProducts(query),
  });
}
