import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { RejectTransferModal } from './reject-transfer-modal';
import { useSubmitTransfer } from '../hooks/use-submit-transfer';
import { useApproveTransfer } from '../hooks/use-approve-transfer';
import { useRejectTransfer } from '../hooks/use-reject-transfer';
import { useCancelTransfer } from '../hooks/use-cancel-transfer';
import { useCompleteTransfer } from '../hooks/use-complete-transfer';
import { parseApiError } from '@/lib/parse-error';
import type { Transfer } from '@/types/api';
import type { TransferPermissions } from '../hooks/use-transfer-permissions';

interface TransferActionFooterProps {
  transfer: Transfer;
  permissions: TransferPermissions;
}

export function TransferActionFooter({ transfer, permissions }: TransferActionFooterProps) {
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const submitMutation = useSubmitTransfer(transfer.id);
  const approveMutation = useApproveTransfer(transfer.id);
  const rejectMutation = useRejectTransfer(transfer.id);
  const cancelMutation = useCancelTransfer(transfer.id);
  const completeMutation = useCompleteTransfer(transfer.id);

  const hasActions =
    permissions.canSubmit ||
    permissions.canApprove ||
    permissions.canReject ||
    permissions.canCancel ||
    permissions.canComplete;

  if (!hasActions) return null;

  return (
    <>
      <div className="sticky bottom-0 bg-ink-50 dark:bg-ink-900 border-t border-ink-900/10 dark:border-ink-50/10 px-8 py-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            {permissions.canCancel && (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="text-sm font-sans text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors"
              >
                Cancel transfer
              </button>
            )}
          </div>
          <div className="flex items-center gap-5">
            {permissions.canReject && (
              <button
                type="button"
                onClick={() => setRejectOpen(true)}
                className="text-sm font-sans text-ink-400 dark:text-ink-500 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
              >
                Reject
              </button>
            )}
            {permissions.canSubmit && (
              <div className="flex flex-col items-end gap-1">
                {transfer.items != null && transfer.items.length === 0 && (
                  <p className="text-xs font-sans text-ink-400 dark:text-ink-500">
                    Add at least one item before submitting
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setConfirmSubmit(true)}
                  disabled={submitMutation.isPending || (transfer.items != null && transfer.items.length === 0)}
                  className="h-10 px-6 bg-ink-900 dark:bg-ink-50 text-white dark:text-ink-900 font-sans font-medium text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  {submitMutation.isPending ? 'Submitting…' : 'Submit for approval'}
                </button>
              </div>
            )}
            {permissions.canApprove && (
              <button
                type="button"
                onClick={() => setConfirmApprove(true)}
                disabled={approveMutation.isPending}
                className="h-10 px-6 bg-ink-900 dark:bg-ink-50 text-white dark:text-ink-900 font-sans font-medium text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {approveMutation.isPending ? 'Approving…' : 'Approve'}
              </button>
            )}
            {permissions.canComplete && (
              <button
                type="button"
                onClick={() => setConfirmComplete(true)}
                disabled={completeMutation.isPending}
                className="h-10 px-6 bg-ink-900 dark:bg-ink-50 text-white dark:text-ink-900 font-sans font-medium text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {completeMutation.isPending ? 'Completing…' : 'Mark as complete'}
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        onConfirm={() => {
          submitMutation.mutate(undefined, {
            onSuccess: () => {
              setConfirmSubmit(false);
              toast.success('Transfer submitted for approval.');
            },
            onError: (err) => {
              setConfirmSubmit(false);
              toast.error(parseApiError(err));
            },
          });
        }}
        loading={submitMutation.isPending}
        title="Submit transfer?"
        description="This transfer will be sent for approval. You will not be able to edit it after submission."
        confirmLabel="Submit"
      />

      <ConfirmModal
        open={confirmApprove}
        onClose={() => setConfirmApprove(false)}
        onConfirm={() => {
          approveMutation.mutate(undefined, {
            onSuccess: () => {
              setConfirmApprove(false);
              toast.success('Transfer approved.');
            },
            onError: (err) => {
              setConfirmApprove(false);
              toast.error(parseApiError(err));
            },
          });
        }}
        loading={approveMutation.isPending}
        title="Approve transfer?"
        description="Stock levels will be reserved for this transfer. The warehouse can then mark it as complete once dispatched."
        confirmLabel="Approve"
      />

      <ConfirmModal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() => {
          cancelMutation.mutate(undefined, {
            onSuccess: () => {
              setConfirmCancel(false);
              toast.success('Transfer cancelled.');
            },
            onError: (err) => {
              setConfirmCancel(false);
              toast.error(parseApiError(err));
            },
          });
        }}
        loading={cancelMutation.isPending}
        title="Cancel transfer?"
        description="This transfer will be cancelled and can no longer be processed."
        confirmLabel="Cancel transfer"
      />

      <ConfirmModal
        open={confirmComplete}
        onClose={() => setConfirmComplete(false)}
        onConfirm={() => {
          completeMutation.mutate(undefined, {
            onSuccess: () => {
              setConfirmComplete(false);
              toast.success('Transfer marked as complete. Inventory updated.');
            },
            onError: (err) => {
              setConfirmComplete(false);
              toast.error(parseApiError(err));
            },
          });
        }}
        loading={completeMutation.isPending}
        title="Complete transfer?"
        description="Inventory balances will be updated immediately. This action cannot be undone."
        confirmLabel="Complete"
      />

      <RejectTransferModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={(reason) => {
          rejectMutation.mutate(reason, {
            onSuccess: () => {
              setRejectOpen(false);
              toast.success('Transfer rejected.');
            },
          });
        }}
        loading={rejectMutation.isPending}
      />
    </>
  );
}
