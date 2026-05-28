import { useState } from 'react';
import { SkeletonLine } from '@/components/ui/Skeleton';
import { fmtCurrency, fmtNumber } from '@/lib/format';
import { DateRangeFilter, defaultRange, type DateRangeValue } from '../components/date-range-filter';
import { ReportHeader } from '../components/report-header';
import { EmptyReport } from '../components/empty-report';
import { ErrorReport } from '../components/error-report';
import { useBranchPerformanceReport } from '../hooks/use-branch-performance-report';

export function BranchPerformanceReport() {
  const [range, setRange] = useState<DateRangeValue>(defaultRange(30));
  const { data, isLoading, isError, refetch } = useBranchPerformanceReport(range);

  const maxRevenue = data?.length
    ? Math.max(...data.map((b) => parseFloat(b.totalRevenue) || 0))
    : 0;

  return (
    <div className="px-8 py-8">
      <ReportHeader
        title="Branch Performance"
        subline="Sales performance by location"
        filter={<DateRangeFilter value={range} onChange={setRange} />}
      />
      {isLoading && <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <SkeletonLine key={i} className="h-9 w-full" />)}</div>}
      {isError && <ErrorReport onRetry={refetch} />}
      {!isLoading && data?.length === 0 && <EmptyReport headline="No branch data" subline="Try widening the date range." />}
      {!isLoading && data && data.length > 0 && (
        <table className="w-full">
          <thead>
            <tr>
              {['Branch', 'Txns', 'Units sold', 'Revenue', 'Cost'].map((h, i) => (
                <th key={h} className={`eyebrow text-ink-400 dark:text-ink-500 pb-3 pr-6 border-b border-ink-900/15 dark:border-ink-50/15 font-sans font-medium ${i >= 1 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((b) => {
              const rev = parseFloat(b.totalRevenue) || 0;
              const barPct = maxRevenue > 0 ? (rev / maxRevenue) * 100 : 0;
              return (
                <tr key={b.locationId}>
                  <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10">
                    <p className="text-sm font-sans font-medium text-ink-900 dark:text-ink-100">{b.locationName}</p>
                    <div className="h-0.5 bg-ink-900/5 dark:bg-ink-50/5 mt-1.5"><div className="h-full bg-ink-900/20 dark:bg-ink-50/20" style={{ width: `${barPct}%` }} /></div>
                    <p className="eyebrow text-ink-400 mt-0.5">{b.locationType}</p>
                  </td>
                  <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-right text-sm font-sans tabular-nums text-ink-900 dark:text-ink-100">{fmtNumber(b.salesTransactions)}</td>
                  <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-right text-sm font-sans tabular-nums text-ink-900 dark:text-ink-100">{fmtNumber(b.unitsSold)}</td>
                  <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-right text-sm font-sans font-medium tabular-nums text-ink-900 dark:text-ink-100">{fmtCurrency(b.totalRevenue)}</td>
                  <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-right text-sm font-sans tabular-nums text-ink-500 dark:text-ink-400">{fmtCurrency(b.totalCost)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
