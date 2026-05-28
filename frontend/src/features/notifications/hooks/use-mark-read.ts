import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markRead } from '../api/notifications.api';

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
