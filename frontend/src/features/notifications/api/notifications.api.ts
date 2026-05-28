import api from '@/lib/api';
import type { Notification, PaginatedResponse, UnreadCountResponse } from '@/types/api';

export interface NotificationListParams {
  page?: number;
  limit?: number;
  read?: boolean;
}

export async function getNotifications(params: NotificationListParams = {}): Promise<PaginatedResponse<Notification>> {
  const res = await api.get<PaginatedResponse<Notification>>('/notifications', { params });
  return res.data;
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const res = await api.get<UnreadCountResponse>('/notifications/unread-count');
  return res.data;
}

export async function markRead(id: string): Promise<Notification> {
  const res = await api.patch<Notification>(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllRead(): Promise<void> {
  await api.patch('/notifications/read-all');
}

export async function deleteNotification(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`);
}
