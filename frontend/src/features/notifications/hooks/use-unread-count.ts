import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '../api/notifications.api';

export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: enabled ? 30_000 : false,
    enabled,
  });
}
