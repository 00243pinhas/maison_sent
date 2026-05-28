import * as Dialog from '@radix-ui/react-dialog';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Delete',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-900/50 dark:bg-ink-900/70 data-[state=open]:animate-fadeIn" />
        <Dialog.Content
          onPointerDownOutside={onClose}
          onEscapeKeyDown={onClose}
          className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] max-w-[calc(100vw-2rem)] bg-ink-50 dark:bg-ink-800 border border-ink-900/10 dark:border-ink-50/10 p-8 focus:outline-none data-[state=open]:animate-fadeIn"
        >
          <Dialog.Title className="font-serif text-2xl font-medium text-ink-900 dark:text-ink-50 mb-3">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-sm font-sans text-ink-500 dark:text-ink-400 leading-relaxed mb-8">
            {description}
          </Dialog.Description>
          <div className="flex items-center justify-end gap-6">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-sans text-ink-400 dark:text-ink-500 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="h-10 px-6 bg-ink-900 dark:bg-ink-50 text-white dark:text-ink-900 font-sans font-medium text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {loading ? '…' : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
