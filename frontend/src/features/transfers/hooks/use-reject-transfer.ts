import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rejectTransfer } from '../api/transfers.api';

export function useRejectTransfer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => rejectTransfer(id, reason),
    onSuccess: (transfer) => {
      queryClient.setQueryData(['transfer', id], transfer);
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    },
  });
}
