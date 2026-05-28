import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeTransferItem } from '../api/transfers.api';

export function useRemoveItem(transferId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => removeTransferItem(transferId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer', transferId] });
    },
  });
}
