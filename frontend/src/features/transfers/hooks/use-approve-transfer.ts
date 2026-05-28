import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveTransfer } from '../api/transfers.api';

export function useApproveTransfer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => approveTransfer(id),
    onSuccess: (transfer) => {
      queryClient.setQueryData(['transfer', id], transfer);
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    },
  });
}
