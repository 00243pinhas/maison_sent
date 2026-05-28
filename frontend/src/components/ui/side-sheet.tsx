import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface SideSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function SideSheet({ open, onClose, title, children, footer }: SideSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink-900/30 dark:bg-ink-900/60 data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut" />
        <Dialog.Content
          onPointerDownOutside={onClose}
          onEscapeKeyDown={onClose}
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 w-[520px] max-w-full flex flex-col bg-ink-50 dark:bg-ink-900 border-l border-ink-900/10 dark:border-ink-50/10 focus:outline-none data-[state=open]:animate-slideInRight data-[state=closed]:animate-slideOutRight"
        >
          {/* Header */}
          <div className="shrink-0 flex items-start justify-between px-7 pt-7 pb-5 border-b border-ink-900/10 dark:border-ink-50/10">
            <Dialog.Title className="font-serif text-2xl font-medium text-ink-900 dark:text-ink-50 leading-tight">
              {title}
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -mt-0.5 text-ink-400 hover:text-ink-900 dark:text-ink-500 dark:hover:text-ink-50 transition-colors"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-7 py-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="shrink-0 px-7 py-5 border-t border-ink-900/10 dark:border-ink-50/10">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
