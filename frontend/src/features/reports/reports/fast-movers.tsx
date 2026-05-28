import { useState } from 'react';
import { SkeletonLine } from '@/components/ui/Skeleton';
import { fmtCurrency, fmtNumber } from '@/lib/format';
import { DateRangeFilter, defaultRange, type DateRangeValue } from '../components/date-range-filter';
import { ReportHeader } from '../components/report-header';
import { EmptyReport } from '../components/empty-report';
import { ErrorReport } from '../components/error-report';
import { useFastMoversReport } from '../hooks/use-fast-movers-report';

export function FastMoversReport() {
  const [range, setRange] = useState<DateRangeValue>(defaultRange(30));
  const { data, isLoading, isError, refetch } = useFastMoversReport(range, 50);

  const max = data?.length ? Math.max(...data.map((m) => parseFloat(m.unitsSold) || 0)) : 0;

  return (
    <div className="px-8 py-8">
      <ReportHeader
        title="Fast Movers"
        subline="Top-selling products by units sold"
        filter={<DateRangeFilter value={range} onChange={setRange} />}
      />
      {isLoading && <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <SkeletonLine key={i} className="h-9 w-full" />)}</div>}
      {isError && <ErrorReport onRetry={refetch} />}
      {!isLoading && data?.length === 0 && <EmptyReport headline="No sales in this period" subline="Try widening the date range." />}
      {!isLoading && data && data.length > 0 && (
        <table className="w-full">
          <thead>
            <tr>
              <th className="eyebrow text-ink-400 dark:text-ink-500 pb-3 pr-3 border-b border-ink-900/15 dark:border-ink-50/15 font-sans font-medium text-right w-8">#</th>
              {['Product', 'Units sold', 'Revenue'].map((h, i) => (
                <th key={h} className={`eyebrow text-ink-400 dark:text-ink-500 pb-3 pr-6 border-b border-ink-900/15 dark:border-ink-50/15 font-sans font-medium ${i >= 1 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((m, idx) => {
              const units = parseFloat(m.unitsSold) || 0;
              const barPct = max > 0 ? (units / max) * 100 : 0;
              return (
                <tr key={m.productId}>
                  <td className="py-3.5 pr-3 border-b border-ink-900/10 dark:border-ink-50/10 eyebrow text-ink-400 text-right">{idx + 1}</td>
                  <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10">
                    <p className="text-sm font-sans font-medium text-ink-900 dark:text-ink-100">{m.productName}</p>
                    <div className="h-0.5 bg-ink-900/5 dark:bg-ink-50/5 mt-1.5">
                      <div className="h-full bg-ink-900/25 dark:bg-ink-50/25" style={{ width: `${barPct}%` }} />
                    </div>
                    <p className="eyebrow text-ink-400 dark:text-ink-500 mt-0.5">{m.sku}</p>
                  </td>
                  <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-right text-sm font-sans font-medium tabular-nums text-ink-900 dark:text-ink-100">{fmtNumber(m.unitsSold)}</td>
                  <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-right text-sm font-sans tabular-nums text-ink-900 dark:text-ink-100">{fmtCurrency(m.totalRevenue)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
