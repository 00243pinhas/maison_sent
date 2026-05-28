import api from '@/lib/api';
import type { Supplier, PaginatedResponse } from '@/types/api';
import type { SupplierFormValues } from '../schema';

export async function getSuppliers(params: { page?: number; limit?: number }): Promise<PaginatedResponse<Supplier>> {
  const { data } = await api.get<PaginatedResponse<Supplier>>('/suppliers', { params });
  return data;
}

export async function createSupplier(body: SupplierFormValues): Promise<Supplier> {
  const { data } = await api.post<Supplier>('/suppliers', body);
  return data;
}

export async function updateSupplier(id: string, body: Partial<SupplierFormValues>): Promise<Supplier> {
  const { data } = await api.patch<Supplier>(`/suppliers/${id}`, body);
  return data;
}

export async function deleteSupplier(id: string): Promise<void> {
  await api.delete(`/suppliers/${id}`);
}
