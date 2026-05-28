import { cn } from '@/lib/cn';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'muted';

interface StatusLabelProps {
  label: string;
  variant?: Variant;
  className?: string;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  default: 'text-ink-900 dark:text-ink-50',
  success: 'text-emerald-700 dark:text-emerald-400',
  warning: 'text-amber-700 dark:text-amber-400',
  danger: 'text-red-700 dark:text-red-400',
  muted: 'text-ink-400 dark:text-ink-500',
};

export function StatusLabel({ label, variant = 'default', className }: StatusLabelProps) {
  return (
    <span className={cn('eyebrow', VARIANT_CLASSES[variant], className)}>
      {label}
    </span>
  );
}
