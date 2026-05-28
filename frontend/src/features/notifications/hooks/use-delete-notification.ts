import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteNotification } from '../api/notifications.api';

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
