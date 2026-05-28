import { useState } from 'react';
import { SkeletonLine } from '@/components/ui/Skeleton';
import { INPUT_BASE } from '@/components/ui/field';
import { Pagination } from '@/components/ui/pagination';
import { ReportHeader } from '../components/report-header';
import { EmptyReport } from '../components/empty-report';
import { ErrorReport } from '../components/error-report';
import { useLowStockReport } from '../hooks/use-low-stock-report';

const PAGE_SIZE = 25;

export function LowStockReport() {
  const [minQty, setMinQty] = useState(20);
  const [page, setPage] = useState(1);
  const { data: items, isLoading, isError, refetch } = useLowStockReport(minQty);

  const paginated = items?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) ?? [];

  return (
    <div className="px-8 py-8">
      <ReportHeader
        title="Low Stock"
        subline={`Items below threshold`}
        filter={
          <div className="flex items-center gap-2">
            <label className="eyebrow text-ink-400 dark:text-ink-500 whitespace-nowrap">Threshold</label>
            <input
              type="number"
              min="0"
              value={minQty}
              onChange={(e) => { setMinQty(Number(e.target.value)); setPage(1); }}
              className={`${INPUT_BASE} w-20`}
            />
          </div>
        }
      />
      {isLoading && <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <SkeletonLine key={i} className="h-9 w-full" />)}</div>}
      {isError && <ErrorReport onRetry={refetch} />}
      {!isLoading && items?.length === 0 && <EmptyReport headline="All stock healthy" subline="No items found below the threshold." />}
      {!isLoading && paginated.length > 0 && (
        <>
          <table className="w-full">
            <thead>
              <tr>
                {['Product', 'SKU', 'Location', 'Quantity'].map((h, i) => (
                  <th key={h} className={`eyebrow text-ink-400 dark:text-ink-500 pb-3 pr-6 border-b border-ink-900/15 dark:border-ink-50/15 font-sans font-medium ${i === 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((item) => {
                const qty = parseInt(item.quantity);
                return (
                  <tr key={`${item.productId}-${item.locationId}`} className="hover:bg-ink-900/[0.02] dark:hover:bg-ink-50/[0.02]">
                    <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans font-medium text-ink-900 dark:text-ink-100 max-w-[200px] truncate">{item.productName}</td>
                    <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 font-mono text-xs text-ink-400">{item.sku}</td>
                    <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans text-ink-500 dark:text-ink-400">{item.locationName}</td>
                    <td className={`py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-right text-sm font-sans font-medium tabular-nums ${qty === 0 ? 'text-red-600 dark:text-red-400' : 'text-ink-900 dark:text-ink-100'}`}>{qty.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination page={page} limit={PAGE_SIZE} total={items?.length ?? 0} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
