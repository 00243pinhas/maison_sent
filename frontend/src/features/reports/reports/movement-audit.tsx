import { useState, useEffect } from 'react';
import { SkeletonLine } from '@/components/ui/Skeleton';
import { EditorialSelect } from '@/components/ui/editorial-select';
import { Pagination } from '@/components/ui/pagination';
import { fmtDateTime } from '@/lib/format';
import { getMovementLabel, getMovementMarker } from '@/lib/utils/movement-display';
import type { MovementType } from '@/types/api';
import { DateRangeFilter, defaultRange, type DateRangeValue } from '../components/date-range-filter';
import { ReportHeader } from '../components/report-header';
import { EmptyReport } from '../components/empty-report';
import { ErrorReport } from '../components/error-report';
import { useMovementAuditReport } from '../hooks/use-movement-audit-report';

const PAGE_SIZE = 50;

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'SALE', label: 'Sale' },
  { value: 'RETURN', label: 'Return' },
  { value: 'DAMAGE', label: 'Damage' },
  { value: 'ADJUSTMENT_IN', label: 'Adjustment In' },
  { value: 'ADJUSTMENT_OUT', label: 'Adjustment Out' },
  { value: 'TRANSFER', label: 'Transfer' },
];

export function MovementAuditReport() {
  const [range, setRange] = useState<DateRangeValue>(defaultRange(30));
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [range, typeFilter]);

  const { data, isLoading, isError, refetch } = useMovementAuditReport(range, typeFilter, page, PAGE_SIZE);

  return (
    <div className="px-8 py-8">
      <ReportHeader
        title="Movement Audit"
        subline="Full movement ledger"
        filter={<DateRangeFilter value={range} onChange={setRange} />}
      />

      <div className="flex items-center gap-4 mb-6">
        <EditorialSelect
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={TYPE_OPTIONS}
          className="w-44"
        />
      </div>

      {isLoading && <div className="space-y-3">{Array.from({ length: 10 }).map((_, i) => <SkeletonLine key={i} className="h-9 w-full" />)}</div>}
      {isError && <ErrorReport onRetry={refetch} />}
      {!isLoading && data?.length === 0 && <EmptyReport headline="No movements found" subline="Adjust the date range or type filter." />}

      {!isLoading && data && data.length > 0 && (
        <>
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Date', 'Product', 'Type', 'Qty', 'Location', 'Ref', 'User'].map((h) => (
                    <th key={h} className="eyebrow text-ink-400 dark:text-ink-500 pb-3 pr-6 text-left border-b border-ink-900/15 dark:border-ink-50/15 font-sans font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((m) => (
                  <tr key={m.id} className="hover:bg-ink-900/[0.02] dark:hover:bg-ink-50/[0.02]">
                    <td className="py-3 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-xs font-sans text-ink-400 whitespace-nowrap">{fmtDateTime(m.createdAt)}</td>
                    <td className="py-3 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 max-w-[180px]">
                      <p className="text-sm font-sans text-ink-900 dark:text-ink-100 truncate">{m.productName}</p>
                      <p className="font-mono text-xs text-ink-400">{m.sku}</p>
                    </td>
                    <td className="py-3 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 whitespace-nowrap">
                      <span className="eyebrow text-ink-500 dark:text-ink-400">
                        {getMovementMarker(m.movementType as MovementType)}{' '}
                        {getMovementLabel(m.movementType as MovementType)}
                      </span>
                    </td>
                    <td className="py-3 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans tabular-nums text-right text-ink-900 dark:text-ink-100">{m.quantity.toLocaleString()}</td>
                    <td className="py-3 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-xs font-sans text-ink-500 dark:text-ink-400 max-w-[120px] truncate">{m.fromLocationName ?? m.toLocationName ?? '—'}</td>
                    <td className="py-3 pr-6 border-b border-ink-900/10 dark:border-ink-50/10">{m.referenceNumber ? <span className="font-mono text-xs text-ink-400">{m.referenceNumber}</span> : <span className="text-ink-300 dark:text-ink-700">—</span>}</td>
                    <td className="py-3 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-xs font-sans text-ink-400 max-w-[120px] truncate">{m.performedByEmail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.length >= PAGE_SIZE && (
            <Pagination page={page} limit={PAGE_SIZE} total={page * PAGE_SIZE + (data.length >= PAGE_SIZE ? 1 : 0)} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
