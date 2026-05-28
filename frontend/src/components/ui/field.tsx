import { cn } from '@/lib/cn';

// Base class for all editorial-style inputs (hairline bottom border, no bg, no radius)
export const INPUT_BASE =
  'w-full h-10 px-0 pb-1.5 bg-transparent border-0 border-b border-ink-900/20 dark:border-ink-50/20 font-sans text-sm text-ink-900 dark:text-ink-50 placeholder-ink-300 dark:placeholder-ink-600 focus:outline-none focus:border-ink-900 dark:focus:border-ink-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

export const TEXTAREA_BASE =
  'w-full px-0 py-1.5 bg-transparent border-0 border-b border-ink-900/20 dark:border-ink-50/20 font-sans text-sm text-ink-900 dark:text-ink-50 placeholder-ink-300 dark:placeholder-ink-600 focus:outline-none focus:border-ink-900 dark:focus:border-ink-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed resize-none';

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <label className="eyebrow text-ink-500 dark:text-ink-400">{label}</label>
      {children}
      {hint && !error && (
        <p className="text-[11px] font-sans text-ink-400 dark:text-ink-500 mt-1">{hint}</p>
      )}
      {error && (
        <p className="text-[13px] font-sans text-ink-500 dark:text-ink-400 mt-1">{error}</p>
      )}
    </div>
  );
}
