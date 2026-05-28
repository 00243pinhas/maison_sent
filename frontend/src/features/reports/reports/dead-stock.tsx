import { useState } from 'react';
import { SkeletonLine } from '@/components/ui/Skeleton';
import { EditorialSelect } from '@/components/ui/editorial-select';
import { fmtCurrency } from '@/lib/format';
import { ReportHeader } from '../components/report-header';
import { EmptyReport } from '../components/empty-report';
import { ErrorReport } from '../components/error-report';
import { useDeadStockReport } from '../hooks/use-dead-stock';

const DAY_OPTIONS = [
  { value: '30', label: '30 days' },
  { value: '60', label: '60 days' },
  { value: '90', label: '90 days' },
  { value: '180', label: '180 days' },
  { value: '365', label: '1 year' },
];

export function DeadStockReport() {
  const [days, setDays] = useState(90);
  const { data, isLoading, isError, refetch } = useDeadStockReport(days);

  return (
    <div className="px-8 py-8">
      <ReportHeader
        title="Dead Stock"
        subline="Products with no sales activity"
        filter={
          <EditorialSelect
            value={String(days)}
            onChange={(e) => setDays(Number(e.target.value))}
            options={DAY_OPTIONS}
            className="w-32"
          />
        }
      />
      {isLoading && <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonLine key={i} className="h-9 w-full" />)}</div>}
      {isError && <ErrorReport onRetry={refetch} />}
      {!isLoading && data?.length === 0 && <EmptyReport headline="No dead stock" subline={`All products have had sales activity in the last ${days} days.`} />}
      {!isLoading && data && data.length > 0 && (
        <table className="w-full">
          <thead>
            <tr>
              {['Product', 'SKU', 'Brand', 'Quantity', 'Cost value', 'Days since sale'].map((h, i) => (
                <th key={h} className={`eyebrow text-ink-400 dark:text-ink-500 pb-3 pr-6 border-b border-ink-900/15 dark:border-ink-50/15 font-sans font-medium ${i >= 3 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.productId} className="hover:bg-ink-900/[0.02] dark:hover:bg-ink-50/[0.02]">
                <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans font-medium text-ink-900 dark:text-ink-100">{item.productName}</td>
                <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 font-mono text-xs text-ink-400">{item.sku}</td>
                <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans text-ink-500 dark:text-ink-400">{item.brand}</td>
                <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-right text-sm font-sans tabular-nums text-ink-900 dark:text-ink-100">{item.currentQuantity.toLocaleString()}</td>
                <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-right text-sm font-sans tabular-nums text-ink-900 dark:text-ink-100">{fmtCurrency(item.currentCostValue)}</td>
                <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-right text-sm font-sans tabular-nums text-ink-400 dark:text-ink-500">
                  {item.daysSinceLastSale != null ? `${item.daysSinceLastSale}d` : 'Never sold'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
