import { useState } from 'react';
import { SkeletonLine } from '@/components/ui/Skeleton';
import { fmtNumber } from '@/lib/format';
import type { TransferStatus } from '@/types/api';
import { DateRangeFilter, defaultRange, type DateRangeValue } from '../components/date-range-filter';
import { ReportHeader } from '../components/report-header';
import { EmptyReport } from '../components/empty-report';
import { ErrorReport } from '../components/error-report';
import { useTransferReport } from '../hooks/use-transfer-report';

const STATUS_LABELS: Record<TransferStatus, string> = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending approval',
  APPROVED: 'Approved',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

export function TransferReport() {
  const [range, setRange] = useState<DateRangeValue>(defaultRange(30));
  const { data, isLoading, isError, refetch } = useTransferReport(range);

  return (
    <div className="px-8 py-8">
      <ReportHeader
        title="Transfer Report"
        subline="Transfer activity and route analysis"
        filter={<DateRangeFilter value={range} onChange={setRange} />}
      />
      {isLoading && <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonLine key={i} className="h-6 w-48" />)}</div>}
      {isError && <ErrorReport onRetry={refetch} />}

      {data && (
        <>
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink-900/10 dark:bg-ink-50/10 border border-ink-900/10 dark:border-ink-50/10 mb-10">
            <div className="p-5 bg-ink-50 dark:bg-ink-900">
              <dt className="eyebrow text-ink-400 dark:text-ink-500 mb-2">Total transfers</dt>
              <dd className="font-serif text-xl font-medium text-ink-900 dark:text-ink-50">{fmtNumber(data.totalTransfers)}</dd>
            </div>
            <div className="p-5 bg-ink-50 dark:bg-ink-900">
              <dt className="eyebrow text-ink-400 dark:text-ink-500 mb-2">Avg submit → approve</dt>
              <dd className="font-serif text-xl font-medium text-ink-900 dark:text-ink-50">
                {data.avgSubmitToApproveHours != null ? `${data.avgSubmitToApproveHours.toFixed(1)}h` : '—'}
              </dd>
            </div>
            <div className="p-5 bg-ink-50 dark:bg-ink-900">
              <dt className="eyebrow text-ink-400 dark:text-ink-500 mb-2">Avg approve → complete</dt>
              <dd className="font-serif text-xl font-medium text-ink-900 dark:text-ink-50">
                {data.avgApproveToCompleteHours != null ? `${data.avgApproveToCompleteHours.toFixed(1)}h` : '—'}
              </dd>
            </div>
            <div className="p-5 bg-ink-50 dark:bg-ink-900">
              <dt className="eyebrow text-ink-400 dark:text-ink-500 mb-1">By status</dt>
              <dd className="space-y-0.5 mt-1">
                {(Object.entries(data.byStatus ?? {}) as [TransferStatus, number][]).map(([status, count]) => (
                  <p key={status} className="text-xs font-sans text-ink-500 dark:text-ink-400">
                    {STATUS_LABELS[status]}: <span className="font-medium text-ink-900 dark:text-ink-100">{count}</span>
                  </p>
                ))}
              </dd>
            </div>
          </dl>

          {data.topRoutes?.length > 0 ? (
            <>
              <p className="eyebrow text-ink-400 dark:text-ink-500 mb-4">Top Routes</p>
              <table className="w-full">
                <thead>
                  <tr>
                    {['From', 'To', 'Transfers', 'Units'].map((h, i) => (
                      <th key={h} className={`eyebrow text-ink-400 dark:text-ink-500 pb-3 pr-6 border-b border-ink-900/15 dark:border-ink-50/15 font-sans font-medium ${i >= 2 ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.topRoutes.map((route, i) => (
                    <tr key={i} className="hover:bg-ink-900/[0.02] dark:hover:bg-ink-50/[0.02]">
                      <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans text-ink-900 dark:text-ink-100">{route.fromLocationName}</td>
                      <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans text-ink-900 dark:text-ink-100">{route.toLocationName}</td>
                      <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-right text-sm font-sans tabular-nums text-ink-900 dark:text-ink-100">{fmtNumber(route.count)}</td>
                      <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-right text-sm font-sans tabular-nums text-ink-900 dark:text-ink-100">{fmtNumber(route.totalQuantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <EmptyReport headline="No transfers in this period" subline="Try widening the date range." />
          )}
        </>
      )}
    </div>
  );
}
