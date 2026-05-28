import { useState } from 'react';
import { SkeletonLine } from '@/components/ui/Skeleton';
import { fmtCurrency } from '@/lib/format';
import { DateRangeFilter, defaultRange, type DateRangeValue } from '../components/date-range-filter';
import { ReportHeader } from '../components/report-header';
import { ErrorReport } from '../components/error-report';
import { useRevenueSummaryReport } from '../hooks/use-revenue-summary';

export function RevenueSummaryReport() {
  const [range, setRange] = useState<DateRangeValue>(defaultRange(30));
  const { data, isLoading, isError, refetch } = useRevenueSummaryReport(range);

  const grossMargin = data && data.totalRevenue && data.totalCOGS
    ? ((parseFloat(data.totalRevenue) - parseFloat(data.totalCOGS)) / parseFloat(data.totalRevenue)) * 100
    : null;

  return (
    <div className="px-8 py-8">
      <ReportHeader
        title="Revenue Summary"
        subline="Sales and margin breakdown"
        filter={<DateRangeFilter value={range} onChange={setRange} />}
      />
      {isLoading && <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonLine key={i} className="h-12 w-48" />)}</div>}
      {isError && <ErrorReport onRetry={refetch} />}
      {data && (
        <dl className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 max-w-xl">
          {[
            { label: 'Total Revenue', value: fmtCurrency(data.totalRevenue), serif: true },
            { label: 'Net Revenue', value: fmtCurrency(data.netRevenue), serif: true },
            { label: 'Cost of Goods Sold', value: fmtCurrency(data.totalCOGS) },
            { label: 'Returns Value', value: fmtCurrency(data.returnValue) },
            {
              label: 'Gross Margin',
              value: grossMargin != null ? `${grossMargin.toFixed(1)}%` : '—',
            },
          ].map(({ label, value, serif }) => (
            <div key={label} className="border-b border-ink-900/10 dark:border-ink-50/10 py-5">
              <dt className="eyebrow text-ink-400 dark:text-ink-500 mb-2">{label}</dt>
              <dd className={serif
                ? 'font-serif text-4xl font-medium text-ink-900 dark:text-ink-50'
                : 'font-serif text-2xl font-medium text-ink-500 dark:text-ink-400'
              }>{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
