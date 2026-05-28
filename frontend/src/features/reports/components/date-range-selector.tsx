import { cn } from '@/lib/cn';
import type { DatePreset } from '../hooks/use-report-queries';

const PRESETS: { id: DatePreset; label: string }[] = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: '365d', label: '12 months' },
];

interface DateRangeSelectorProps {
  value: DatePreset;
  onChange: (preset: DatePreset) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex items-center gap-0">
      {PRESETS.map((p, i) => (
        <span key={p.id} className="flex items-center">
          {i > 0 && (
            <span className="mx-3 text-ink-300 dark:text-ink-600 select-none text-xs">·</span>
          )}
          <button
            type="button"
            onClick={() => onChange(p.id)}
            className={cn(
              'text-sm font-sans transition-colors',
              value === p.id
                ? 'font-medium text-ink-900 dark:text-ink-50'
                : 'font-normal text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-300',
            )}
          >
            {p.label}
          </button>
        </span>
      ))}
    </div>
  );
}
