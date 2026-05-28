import api from '@/lib/api';
import type { Movement, InventoryBalance, ReconcileResult, PaginatedResponse } from '@/types/api';
import type { MovementsQuery, BalancesQuery } from '../types';

export async function getMovements(
  query: MovementsQuery,
): Promise<PaginatedResponse<Movement>> {
  const { data } = await api.get<PaginatedResponse<Movement>>('/inventory/movements', {
    params: query,
  });
  return data;
}

export async function getMovement(id: string): Promise<Movement> {
  const { data } = await api.get<Movement>(`/inventory/movements/${id}`);
  return data;
}

export async function getBalances(
  query: BalancesQuery,
): Promise<PaginatedResponse<InventoryBalance>> {
  const { data } = await api.get<PaginatedResponse<InventoryBalance>>('/inventory/balances', {
    params: query,
  });
  return data;
}

export async function getBalance(
  productId: string,
  locationId: string,
): Promise<InventoryBalance | null> {
  const { data } = await api.get<PaginatedResponse<InventoryBalance>>('/inventory/balances', {
    params: { productId, locationId, limit: 1 },
  });
  return data.data[0] ?? null;
}

export async function postMovement<T>(endpoint: string, body: T): Promise<Movement> {
  const { data } = await api.post<Movement>(endpoint, body);
  return data;
}

export async function reconcileBalances(): Promise<ReconcileResult> {
  const { data } = await api.post<ReconcileResult>('/inventory/balances/reconcile');
  return data;
}
