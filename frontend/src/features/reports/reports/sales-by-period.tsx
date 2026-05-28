import { useState } from 'react';
import { SkeletonLine } from '@/components/ui/Skeleton';
import { fmtCurrency } from '@/lib/format';
import { cn } from '@/lib/cn';
import { DateRangeFilter, defaultRange, type DateRangeValue } from '../components/date-range-filter';
import { ReportHeader } from '../components/report-header';
import { EmptyReport } from '../components/empty-report';
import { ErrorReport } from '../components/error-report';
import { MonochromeLineChart } from '../components/monochrome-line-chart';
import { useSalesByPeriodReport } from '../hooks/use-sales-by-period';

const INTERVALS = ['day', 'week', 'month'] as const;
type Interval = typeof INTERVALS[number];

export function SalesByPeriodReport() {
  const [range, setRange] = useState<DateRangeValue>(defaultRange(30));
  const [interval, setInterval] = useState<Interval>('day');
  const { data, isLoading, isError, refetch } = useSalesByPeriodReport(range, interval);

  const summary = data?.reduce(
    (acc, row) => ({
      totalSales: acc.totalSales + (parseFloat(String(row.totalSales)) || 0),
      totalRevenue: acc.totalRevenue + (parseFloat(row.totalRevenue) || 0),
      totalReturns: acc.totalReturns + (parseFloat(row.totalReturnsValue) || 0),
      netRevenue: acc.netRevenue + (parseFloat(row.netRevenue) || 0),
    }),
    { totalSales: 0, totalRevenue: 0, totalReturns: 0, netRevenue: 0 },
  );

  return (
    <div className="px-8 py-8">
      <ReportHeader
        title="Sales by Period"
        subline="Revenue trend over time"
        filter={<DateRangeFilter value={range} onChange={setRange} />}
      />

      <div className="flex items-center gap-0 mb-6">
        {INTERVALS.map((iv, i) => (
          <span key={iv} className="flex items-center">
            {i > 0 && <span className="mx-3 text-ink-300 dark:text-ink-600 text-xs select-none">·</span>}
            <button
              type="button"
              onClick={() => setInterval(iv)}
              className={cn('text-sm font-sans transition-colors capitalize',
                interval === iv
                  ? 'font-medium text-ink-900 dark:text-ink-50'
                  : 'font-normal text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-300',
              )}
            >{iv}</button>
          </span>
        ))}
      </div>

      {isLoading && <div className="space-y-2 mb-6">{Array.from({ length: 3 }).map((_, i) => <SkeletonLine key={i} className="h-4 w-full" />)}</div>}
      {isError && <ErrorReport onRetry={refetch} />}
      {!isLoading && data?.length === 0 && <EmptyReport headline="No sales in this period" subline="Try widening the date range." />}

      {!isLoading && data && data.length > 0 && (
        <>
          <div className="mb-8">
            <MonochromeLineChart
              data={data as unknown as Array<Record<string, unknown>>}
              xKey="period"
              yKey="netRevenue"
              yFormat={(v) => fmtCurrency(String(v))}
              height={240}
            />
          </div>

          {summary && (
            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink-900/10 dark:bg-ink-50/10 border border-ink-900/10 dark:border-ink-50/10">
              {[
                { label: 'Total sales', value: summary.totalSales.toLocaleString() },
                { label: 'Total revenue', value: fmtCurrency(summary.totalRevenue) },
                { label: 'Returns value', value: fmtCurrency(summary.totalReturns) },
                { label: 'Net revenue', value: fmtCurrency(summary.netRevenue) },
              ].map(({ label, value }) => (
                <div key={label} className="p-5 bg-ink-50 dark:bg-ink-900">
                  <dt className="eyebrow text-ink-400 dark:text-ink-500 mb-1">{label}</dt>
                  <dd className="font-serif text-xl font-medium text-ink-900 dark:text-ink-50">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </>
      )}
    </div>
  );
}
