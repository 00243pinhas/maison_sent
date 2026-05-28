import { useQuery } from '@tanstack/react-query';
import { getNotifications, type NotificationListParams } from '../api/notifications.api';

export function useNotifications(params: NotificationListParams = {}) {
  return useQuery({
    queryKey: ['notifications', 'list', params],
    queryFn: () => getNotifications(params),
  });
}
