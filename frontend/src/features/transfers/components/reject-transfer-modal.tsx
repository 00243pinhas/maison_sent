import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { TEXTAREA_BASE } from '@/components/ui/field';

interface RejectTransferModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}

export function RejectTransferModal({
  open,
  onClose,
  onConfirm,
  loading = false,
}: RejectTransferModalProps) {
  const [reason, setReason] = useState('');

  function handleConfirm() {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  }

  function handleClose() {
    setReason('');
    onClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-900/50 dark:bg-ink-900/70 data-[state=open]:animate-fadeIn" />
        <Dialog.Content
          onPointerDownOutside={handleClose}
          onEscapeKeyDown={handleClose}
          className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] max-w-[calc(100vw-2rem)] bg-ink-50 dark:bg-ink-800 border border-ink-900/10 dark:border-ink-50/10 p-8 focus:outline-none data-[state=open]:animate-fadeIn"
        >
          <Dialog.Title className="font-serif text-2xl font-medium text-ink-900 dark:text-ink-50 mb-3">
            Reject transfer?
          </Dialog.Title>
          <Dialog.Description className="text-sm font-sans text-ink-500 dark:text-ink-400 leading-relaxed mb-6">
            Provide a reason for rejection. This will be visible to the requester.
          </Dialog.Description>
          <div className="mb-8">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Enter rejection reason…"
              className={TEXTAREA_BASE}
              autoFocus
            />
            {!reason.trim() && (
              <p className="text-[11px] font-sans text-ink-400 dark:text-ink-500 mt-1.5">
                A reason is required.
              </p>
            )}
          </div>
          <div className="flex items-center justify-end gap-6">
            <button
              type="button"
              onClick={handleClose}
              className="text-sm font-sans text-ink-400 dark:text-ink-500 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading || !reason.trim()}
              className="h-10 px-6 bg-ink-900 dark:bg-ink-50 text-white dark:text-ink-900 font-sans font-medium text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {loading ? '…' : 'Reject'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
