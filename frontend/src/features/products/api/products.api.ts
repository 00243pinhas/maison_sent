import api from '@/lib/api';
import type { Product, PaginatedResponse } from '@/types/api';
import type { ProductFormValues } from '../schema';

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  supplierId?: string;
  status?: string;
}

export async function getProducts(query: ProductQuery): Promise<PaginatedResponse<Product>> {
  const { data } = await api.get<PaginatedResponse<Product>>('/products', { params: query });
  return data;
}

export async function createProduct(body: ProductFormValues): Promise<Product> {
  const { data } = await api.post<Product>('/products', body);
  return data;
}

export async function updateProduct(id: string, body: Partial<ProductFormValues>): Promise<Product> {
  const { data } = await api.patch<Product>(`/products/${id}`, body);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}
