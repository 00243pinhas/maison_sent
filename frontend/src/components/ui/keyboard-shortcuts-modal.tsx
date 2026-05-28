import * as Dialog from '@radix-ui/react-dialog';
import { KbdHint } from './kbd-hint';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS: Array<{ description: string; keys: string[] }> = [
  { description: 'Open command palette', keys: ['⌘', 'K'] },
  { description: 'Show keyboard shortcuts', keys: ['?'] },
  { description: 'Go to dashboard', keys: ['G', 'D'] },
  { description: 'Go to inventory', keys: ['G', 'I'] },
  { description: 'Go to transfers', keys: ['G', 'T'] },
  { description: 'Go to reports', keys: ['G', 'R'] },
  { description: 'Close dialog / sheet / popover', keys: ['Esc'] },
];

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-900/50 dark:bg-ink-900/70 data-[state=open]:animate-fadeIn" />
        <Dialog.Content
          onPointerDownOutside={onClose}
          onEscapeKeyDown={onClose}
          className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] max-w-[calc(100vw-2rem)] bg-ink-50 dark:bg-ink-800 border border-ink-900/10 dark:border-ink-50/10 p-8 focus:outline-none data-[state=open]:animate-fadeIn"
        >
          <Dialog.Title className="font-serif text-2xl font-medium text-ink-900 dark:text-ink-50 mb-6">
            Keyboard shortcuts
          </Dialog.Title>
          <dl className="space-y-3">
            {SHORTCUTS.map((s) => (
              <div key={s.description} className="flex items-center justify-between">
                <dt className="text-sm font-sans text-ink-600 dark:text-ink-400">{s.description}</dt>
                <dd><KbdHint keys={s.keys} /></dd>
              </div>
            ))}
          </dl>
          <button
            type="button"
            onClick={onClose}
            className="mt-8 text-sm font-sans text-ink-400 dark:text-ink-500 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
          >
            Close
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
