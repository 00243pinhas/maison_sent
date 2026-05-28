import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitTransfer } from '../api/transfers.api';

export function useSubmitTransfer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => submitTransfer(id),
    onSuccess: (transfer) => {
      queryClient.setQueryData(['transfer', id], transfer);
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    },
  });
}
