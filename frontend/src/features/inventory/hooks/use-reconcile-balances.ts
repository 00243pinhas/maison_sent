import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { reconcileBalances } from '../api/inventory.api';
import { parseApiError } from '@/lib/parse-error';

export function useReconcileBalances(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reconcileBalances,
    onSuccess: (result) => {
      void qc.invalidateQueries({ queryKey: ['balances'] });
      void qc.invalidateQueries({ queryKey: ['balance'] });
      toast.success(
        `Reconciled in ${result.durationMs}ms — replayed ${result.replayedMovements} movements, rebuilt ${result.rebuiltBalances} balances`,
      );
      onSuccess?.();
    },
    onError: (err) => toast.error(parseApiError(err)),
  });
}
