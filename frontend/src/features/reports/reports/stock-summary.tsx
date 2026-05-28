import { SkeletonLine } from '@/components/ui/Skeleton';
import { fmtCurrency, fmtNumber } from '@/lib/format';
import { ReportHeader } from '../components/report-header';
import { EmptyReport } from '../components/empty-report';
import { ErrorReport } from '../components/error-report';
import { useStockSummaryReport } from '../hooks/use-stock-summary';

export function StockSummaryReport() {
  const { data, isLoading, isError, refetch } = useStockSummaryReport();

  return (
    <div className="px-8 py-8">
      <ReportHeader title="Stock Summary" subline="Current snapshot across all locations" />

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonLine key={i} className="h-4 w-48" />)}
        </div>
      )}
      {isError && <ErrorReport onRetry={refetch} />}

      {data && (
        <>
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink-900/10 dark:bg-ink-50/10 border border-ink-900/10 dark:border-ink-50/10 mb-10">
            {[
              { label: 'Total products', value: fmtNumber(data.totalProducts) },
              { label: 'Total units', value: fmtNumber(data.totalQuantity) },
              { label: 'Cost value', value: fmtCurrency(data.totalCostValue) },
              { label: 'Selling value', value: fmtCurrency(data.totalSellingValue) },
            ].map(({ label, value }) => (
              <div key={label} className="p-5 bg-ink-50 dark:bg-ink-900">
                <dt className="eyebrow text-ink-400 dark:text-ink-500 mb-2">{label}</dt>
                <dd className="font-serif text-xl font-medium text-ink-900 dark:text-ink-50">{value}</dd>
              </div>
            ))}
          </dl>

          {data.byLocation?.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr>
                  {['Location', 'Type', 'Products', 'Units', 'Cost value', 'Selling value'].map((h, i) => (
                    <th key={h} className={`eyebrow text-ink-400 dark:text-ink-500 pb-3 pr-6 border-b border-ink-900/15 dark:border-ink-50/15 font-sans font-medium ${i >= 2 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.byLocation.map((row) => (
                  <tr key={row.locationId} className="hover:bg-ink-900/[0.02] dark:hover:bg-ink-50/[0.02]">
                    <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans font-medium text-ink-900 dark:text-ink-100">{row.locationName}</td>
                    <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 eyebrow text-ink-400 dark:text-ink-500">{row.locationType}</td>
                    <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans text-right tabular-nums text-ink-900 dark:text-ink-100">{fmtNumber(row.productCount)}</td>
                    <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans text-right tabular-nums text-ink-900 dark:text-ink-100">{fmtNumber(row.totalQuantity)}</td>
                    <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans text-right tabular-nums text-ink-900 dark:text-ink-100">{fmtCurrency(row.costValue)}</td>
                    <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans font-medium text-right tabular-nums text-ink-900 dark:text-ink-100">{fmtCurrency(row.sellingValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyReport headline="No location data" subline="Stock locations will appear here once inventory is recorded." />
          )}
        </>
      )}
    </div>
  );
}
