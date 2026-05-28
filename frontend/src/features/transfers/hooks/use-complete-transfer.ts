import { useMutation, useQueryClient } from '@tanstack/react-query';
import { completeTransfer } from '../api/transfers.api';

export function useCompleteTransfer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => completeTransfer(id),
    onSuccess: (transfer) => {
      queryClient.setQueryData(['transfer', id], transfer);
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
    },
  });
}
