import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addTransferItem } from '../api/transfers.api';
import type { TransferItemValues } from '../schemas';

export function useAddItem(transferId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: TransferItemValues) => addTransferItem(transferId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfer', transferId] });
    },
  });
}
