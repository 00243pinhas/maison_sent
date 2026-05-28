import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface FieldEntry {
  label: string;
  value: React.ReactNode;
}

interface ReadOnlySheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: FieldEntry[];
}

export function ReadOnlySheet({ open, onClose, title, fields }: ReadOnlySheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink-900/30 dark:bg-ink-900/60 data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut" />
        <Dialog.Content
          onPointerDownOutside={onClose}
          onEscapeKeyDown={onClose}
          className="fixed inset-y-0 right-0 z-50 w-[520px] max-w-full flex flex-col bg-ink-50 dark:bg-ink-900 border-l border-ink-900/10 dark:border-ink-50/10 focus:outline-none data-[state=open]:animate-slideInRight data-[state=closed]:animate-slideOutRight"
        >
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

          <div className="flex-1 overflow-y-auto px-7 py-6">
            <dl className="space-y-5">
              {fields.map((field, i) => (
                <div key={i}>
                  <dt className="eyebrow text-ink-400 dark:text-ink-500 mb-1">{field.label}</dt>
                  <dd className="text-sm font-sans text-ink-900 dark:text-ink-100 leading-relaxed">
                    {field.value ?? <span className="text-ink-300 dark:text-ink-600">—</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="shrink-0 px-7 py-5 border-t border-ink-900/10 dark:border-ink-50/10 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-sans text-ink-400 dark:text-ink-500 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
            >
              Close
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
