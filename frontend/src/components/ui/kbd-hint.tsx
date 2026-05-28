import { cn } from '@/lib/cn';

interface KbdHintProps {
  keys: string | string[];
  className?: string;
}

export function KbdHint({ keys, className }: KbdHintProps) {
  const keyArr = Array.isArray(keys) ? keys : [keys];
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {keyArr.map((key, i) => (
        <kbd
          key={i}
          className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 font-mono text-[11px] text-ink-500 dark:text-ink-400 bg-ink-100 dark:bg-ink-800 border border-ink-900/15 dark:border-ink-50/15"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}
