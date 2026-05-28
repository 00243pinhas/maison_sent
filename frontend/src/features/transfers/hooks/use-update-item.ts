import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTransferItem } from '../api/transfers.api';

export function useUpdateItem(transferId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateTransferItem(transferId, itemId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer', transferId] });
    },
  });
}
