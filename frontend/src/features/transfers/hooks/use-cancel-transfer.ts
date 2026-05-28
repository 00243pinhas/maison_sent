import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelTransfer } from '../api/transfers.api';

export function useCancelTransfer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancelTransfer(id),
    onSuccess: (transfer) => {
      queryClient.setQueryData(['transfer', id], transfer);
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    },
  });
}
