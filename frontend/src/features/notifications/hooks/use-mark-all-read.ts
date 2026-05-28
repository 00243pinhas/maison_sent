import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markAllRead } from '../api/notifications.api';

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
