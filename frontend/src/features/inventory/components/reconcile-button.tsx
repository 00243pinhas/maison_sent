import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { useReconcileBalances } from '../hooks/use-reconcile-balances';

export function ReconcileButton() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mutation = useReconcileBalances(() => setConfirmOpen(false));

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="flex items-center gap-2 text-sm font-sans text-ink-400 dark:text-ink-500 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
      >
        <RefreshCw size={13} strokeWidth={1.5} />
        Reconcile balances
      </button>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => mutation.mutate()}
        loading={mutation.isPending}
        title="Reconcile balances?"
        description="This rebuilds the entire inventory_balances cache by replaying every movement in history. Use only if balances appear out of sync with movement history. The operation runs in a transaction and takes a few seconds."
        confirmLabel="Reconcile"
      />
    </>
  );
}
