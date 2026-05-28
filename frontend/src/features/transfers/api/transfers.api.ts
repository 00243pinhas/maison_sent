import api from '@/lib/api';
import type { Transfer, TransferItem, PaginatedResponse } from '@/types/api';
import type { TransfersQuery } from '../types';
import type { NewTransferValues, TransferItemValues } from '../schemas';

export async function getTransfers(query: TransfersQuery): Promise<PaginatedResponse<Transfer>> {
  const params: Record<string, unknown> = { ...query };
  if (!params.status) delete params.status;
  const { data } = await api.get<PaginatedResponse<Transfer>>('/transfers', { params });
  return data;
}

export async function getTransfer(id: string): Promise<Transfer> {
  const { data } = await api.get<Transfer>(`/transfers/${id}`);
  return data;
}

export async function createTransfer(body: NewTransferValues): Promise<Transfer> {
  const { data } = await api.post<Transfer>('/transfers', body);
  return data;
}

export async function updateTransfer(
  id: string,
  body: { referenceNumber?: string | null; notes?: string | null },
): Promise<Transfer> {
  const { data } = await api.patch<Transfer>(`/transfers/${id}`, body);
  return data;
}

export async function addTransferItem(
  transferId: string,
  body: TransferItemValues,
): Promise<TransferItem> {
  const { data } = await api.post<TransferItem>(`/transfers/${transferId}/items`, body);
  return data;
}

export async function updateTransferItem(
  transferId: string,
  itemId: string,
  body: { quantity: number },
): Promise<TransferItem> {
  const { data } = await api.patch<TransferItem>(`/transfers/${transferId}/items/${itemId}`, body);
  return data;
}

export async function removeTransferItem(transferId: string, itemId: string): Promise<void> {
  await api.delete(`/transfers/${transferId}/items/${itemId}`);
}

export async function submitTransfer(id: string): Promise<Transfer> {
  const { data } = await api.post<Transfer>(`/transfers/${id}/submit`);
  return data;
}

export async function approveTransfer(id: string): Promise<Transfer> {
  const { data } = await api.post<Transfer>(`/transfers/${id}/approve`);
  return data;
}

export async function rejectTransfer(id: string, reason: string): Promise<Transfer> {
  const { data } = await api.post<Transfer>(`/transfers/${id}/reject`, { reason });
  return data;
}

export async function cancelTransfer(id: string): Promise<Transfer> {
  const { data } = await api.post<Transfer>(`/transfers/${id}/cancel`);
  return data;
}

export async function completeTransfer(id: string): Promise<Transfer> {
  const { data } = await api.post<Transfer>(`/transfers/${id}/complete`);
  return data;
}
