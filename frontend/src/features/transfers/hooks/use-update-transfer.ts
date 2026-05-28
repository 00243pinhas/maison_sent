import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTransfer } from '../api/transfers.api';

export function useUpdateTransfer(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { referenceNumber?: string | null; notes?: string | null }) =>
      updateTransfer(id, body),
    onSuccess: (transfer) => {
      queryClient.setQueryData(['transfer', id], transfer);
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
    },
  });
}
