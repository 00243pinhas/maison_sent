import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';
import { INPUT_BASE } from '@/components/ui/field';

export interface DateRangeValue {
  from: string;
  to: string;
}

function toInputDate(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

const PRESETS: Array<{ label: string; getRange: () => DateRangeValue }> = [
  {
    label: 'Last 7 days',
    getRange: () => ({ from: toInputDate(subDays(new Date(), 7)), to: toInputDate(new Date()) }),
  },
  {
    label: 'Last 30 days',
    getRange: () => ({ from: toInputDate(subDays(new Date(), 30)), to: toInputDate(new Date()) }),
  },
  {
    label: 'This month',
    getRange: () => ({ from: toInputDate(startOfMonth(new Date())), to: toInputDate(new Date()) }),
  },
  {
    label: 'Last month',
    getRange: () => ({
      from: toInputDate(startOfMonth(subMonths(new Date(), 1))),
      to: toInputDate(endOfMonth(subMonths(new Date(), 1))),
    }),
  },
  {
    label: 'This year',
    getRange: () => ({ from: toInputDate(startOfYear(new Date())), to: toInputDate(new Date()) }),
  },
];

interface DateRangeFilterProps {
  value: DateRangeValue;
  onChange: (v: DateRangeValue) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={value.from}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className={`${INPUT_BASE} w-36`}
        />
        <span className="text-ink-300 dark:text-ink-600 text-sm select-none">–</span>
        <input
          type="date"
          value={value.to}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className={`${INPUT_BASE} w-36`}
        />
      </div>
      <div className="flex items-center gap-0 flex-wrap">
        {PRESETS.map((p, i) => (
          <span key={p.label} className="flex items-center">
            {i > 0 && (
              <span className="mx-2 text-ink-300 dark:text-ink-600 select-none text-xs">·</span>
            )}
            <button
              type="button"
              onClick={() => onChange(p.getRange())}
              className="text-xs font-sans text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-300 transition-colors"
            >
              {p.label}
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export function defaultRange(days = 30): DateRangeValue {
  return {
    from: toInputDate(subDays(new Date(), days)),
    to: toInputDate(new Date()),
  };
}
