import { cn } from '@/lib/cn';

interface Action {
  label: string;
  onClick: () => void;
  loading?: boolean;
  variant?: 'default' | 'danger';
}

interface InlineActionRowProps {
  actions: Action[];
  className?: string;
}

export function InlineActionRow({ actions, className }: InlineActionRowProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          disabled={action.loading}
          className={cn(
            'text-xs font-sans font-medium transition-colors disabled:opacity-50',
            action.variant === 'danger'
              ? 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200'
              : 'text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-50',
          )}
        >
          {action.loading ? '…' : action.label}
        </button>
      ))}
    </div>
  );
}
