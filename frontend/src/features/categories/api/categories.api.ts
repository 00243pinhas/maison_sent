import api from '@/lib/api';
import type { Category, PaginatedResponse } from '@/types/api';
import type { CategoryFormValues } from '../schema';

export async function getCategories(params: { page?: number; limit?: number }): Promise<PaginatedResponse<Category>> {
  const { data } = await api.get<PaginatedResponse<Category>>('/categories', { params });
  return data;
}

export async function createCategory(body: CategoryFormValues): Promise<Category> {
  const { data } = await api.post<Category>('/categories', body);
  return data;
}

export async function updateCategory(id: string, body: Partial<CategoryFormValues>): Promise<Category> {
  const { data } = await api.patch<Category>(`/categories/${id}`, body);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}
