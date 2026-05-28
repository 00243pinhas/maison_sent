import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTransfer } from '../api/transfers.api';
import type { NewTransferValues } from '../schemas';
import type { Transfer } from '@/types/api';

export function useCreateTransfer(onSuccess: (transfer: Transfer) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: NewTransferValues) => createTransfer(values),
    onSuccess: (transfer) => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      onSuccess(transfer);
    },
  });
}
