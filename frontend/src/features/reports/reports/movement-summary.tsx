import { useState } from 'react';
import { SkeletonLine } from '@/components/ui/Skeleton';
import { fmtNumber } from '@/lib/format';
import { getMovementLabel } from '@/lib/utils/movement-display';
import type { MovementType } from '@/types/api';
import { DateRangeFilter, defaultRange, type DateRangeValue } from '../components/date-range-filter';
import { ReportHeader } from '../components/report-header';
import { EmptyReport } from '../components/empty-report';
import { ErrorReport } from '../components/error-report';
import { useMovementSummaryReport } from '../hooks/use-movement-summary-report';

export function MovementSummaryReport() {
  const [range, setRange] = useState<DateRangeValue>(defaultRange(30));
  const { data, isLoading, isError, refetch } = useMovementSummaryReport(range);

  const max = data?.length ? Math.max(...data.map((r) => parseInt(r.transactionCount) || 0)) : 0;

  return (
    <div className="px-8 py-8">
      <ReportHeader
        title="Movement Summary"
        subline="Transaction counts by movement type"
        filter={<DateRangeFilter value={range} onChange={setRange} />}
      />
      {isLoading && <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonLine key={i} className="h-9 w-full" />)}</div>}
      {isError && <ErrorReport onRetry={refetch} />}
      {!isLoading && data?.length === 0 && <EmptyReport headline="No movements in this period" subline="Try widening the date range." />}
      {!isLoading && data && data.length > 0 && (
        <div>
          <div className="grid grid-cols-[1fr_120px_120px] gap-4 pb-2 border-b border-ink-900/15 dark:border-ink-50/15">
            <p className="eyebrow text-ink-400 dark:text-ink-500">Type</p>
            <p className="eyebrow text-ink-400 dark:text-ink-500 text-right">Transactions</p>
            <p className="eyebrow text-ink-400 dark:text-ink-500 text-right">Units</p>
          </div>
          {data.map((row) => {
            const txns = parseInt(row.transactionCount) || 0;
            const barPct = max > 0 ? (txns / max) * 100 : 0;
            return (
              <div key={row.movementType} className="border-b border-ink-900/10 dark:border-ink-50/10 last:border-0">
                <div className="grid grid-cols-[1fr_120px_120px] gap-4 py-3 items-center">
                  <p className="text-sm font-sans text-ink-900 dark:text-ink-100">
                    {getMovementLabel(row.movementType as MovementType)}
                  </p>
                  <p className="text-sm font-sans text-right tabular-nums text-ink-900 dark:text-ink-100">{fmtNumber(row.transactionCount)}</p>
                  <p className="text-sm font-sans text-right tabular-nums text-ink-900 dark:text-ink-100">{fmtNumber(row.totalQuantity)}</p>
                </div>
                <div className="h-0.5 bg-ink-900/5 dark:bg-ink-50/5">
                  <div className="h-full bg-ink-900/20 dark:bg-ink-50/20 transition-all" style={{ width: `${barPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
