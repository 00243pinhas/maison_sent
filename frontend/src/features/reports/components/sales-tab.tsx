import { SkeletonLine } from '@/components/ui/Skeleton';
import { ErrorBox } from '@/components/ui/ErrorBox';
import { fmtCurrency, fmtNumber } from '@/lib/format';
import { useReportFastMovers, useReportBranchPerformance } from '../hooks/use-report-queries';
import type { DatePreset } from '../hooks/use-report-queries';

interface SalesTabProps {
  preset: DatePreset;
}

export function SalesTab({ preset }: SalesTabProps) {
  const {
    data: movers,
    isLoading: movLoading,
    isError: movError,
  } = useReportFastMovers(preset);
  const {
    data: branches,
    isLoading: branchLoading,
    isError: branchError,
  } = useReportBranchPerformance(preset);

  const maxRevenue = branches?.length
    ? Math.max(...branches.map((b) => parseFloat(b.totalRevenue) || 0))
    : 0;

  return (
    <div className="space-y-12">
      {/* Top sellers */}
      <div>
        <p className="eyebrow text-ink-400 dark:text-ink-500 mb-4">Top Sellers</p>
        {movError && <ErrorBox message="Could not load top sellers." />}
        {movLoading && (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex justify-between gap-4">
                <SkeletonLine className="h-3.5 w-2/3" />
                <SkeletonLine className="h-3.5 w-20" />
              </div>
            ))}
          </div>
        )}
        {!movLoading && movers && movers.length > 0 && (
          <>
            <div className="grid grid-cols-[32px_1fr_100px_120px] gap-4 pb-2 border-b border-ink-900/15 dark:border-ink-50/15">
              <div />
              <p className="eyebrow text-ink-400 dark:text-ink-500">Product</p>
              <p className="eyebrow text-ink-400 dark:text-ink-500 text-right">Units sold</p>
              <p className="eyebrow text-ink-400 dark:text-ink-500 text-right">Revenue</p>
            </div>
            {movers.map((m, idx) => (
              <div
                key={m.productId}
                className="grid grid-cols-[32px_1fr_100px_120px] gap-4 py-3.5 border-b border-ink-900/10 dark:border-ink-50/10 last:border-0 items-center"
              >
                <span className="eyebrow text-ink-400 dark:text-ink-500 text-right">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-sans font-medium text-ink-900 dark:text-ink-100 truncate">
                    {m.productName}
                  </p>
                  <p className="eyebrow text-ink-400 dark:text-ink-500 mt-0.5">{m.sku}</p>
                </div>
                <p className="text-sm font-sans text-ink-900 dark:text-ink-100 text-right tabular-nums">
                  {fmtNumber(m.unitsSold)}
                </p>
                <p className="text-sm font-sans font-medium text-ink-900 dark:text-ink-100 text-right tabular-nums">
                  {fmtCurrency(m.totalRevenue)}
                </p>
              </div>
            ))}
          </>
        )}
        {!movLoading && movers?.length === 0 && (
          <p className="text-sm text-ink-400 font-sans">No sales recorded in this period.</p>
        )}
      </div>

      {/* Branch performance */}
      <div>
        <p className="eyebrow text-ink-400 dark:text-ink-500 mb-4">Branch Performance</p>
        {branchError && <ErrorBox message="Could not load branch performance." />}
        {branchLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonLine key={i} className="h-9 w-full" />
            ))}
          </div>
        )}
        {!branchLoading && branches && branches.length > 0 && (
          <>
            <div className="grid grid-cols-[1fr_80px_100px_120px_120px] gap-4 pb-2 border-b border-ink-900/15 dark:border-ink-50/15">
              <p className="eyebrow text-ink-400 dark:text-ink-500">Branch</p>
              <p className="eyebrow text-ink-400 dark:text-ink-500 text-right">Txns</p>
              <p className="eyebrow text-ink-400 dark:text-ink-500 text-right">Units</p>
              <p className="eyebrow text-ink-400 dark:text-ink-500 text-right">Revenue</p>
              <p className="eyebrow text-ink-400 dark:text-ink-500 text-right">Cost</p>
            </div>
            {branches.map((b) => {
              const revenue = parseFloat(b.totalRevenue) || 0;
              const barWidth = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
              return (
                <div
                  key={b.locationId}
                  className="border-b border-ink-900/10 dark:border-ink-50/10 last:border-0"
                >
                  <div className="grid grid-cols-[1fr_80px_100px_120px_120px] gap-4 py-3.5 items-center">
                    <div>
                      <p className="text-sm font-sans font-medium text-ink-900 dark:text-ink-100">
                        {b.locationName}
                      </p>
                      <p className="eyebrow text-ink-400 dark:text-ink-500 mt-0.5">
                        {b.locationType}
                      </p>
                    </div>
                    <p className="text-sm font-sans text-ink-900 dark:text-ink-100 text-right tabular-nums">
                      {fmtNumber(b.salesTransactions)}
                    </p>
                    <p className="text-sm font-sans text-ink-900 dark:text-ink-100 text-right tabular-nums">
                      {fmtNumber(b.unitsSold)}
                    </p>
                    <p className="text-sm font-sans font-medium text-ink-900 dark:text-ink-100 text-right tabular-nums">
                      {fmtCurrency(b.totalRevenue)}
                    </p>
                    <p className="text-sm font-sans text-ink-500 dark:text-ink-400 text-right tabular-nums">
                      {fmtCurrency(b.totalCost)}
                    </p>
                  </div>
                  <div className="h-0.5 bg-ink-900/5 dark:bg-ink-50/5">
                    <div
                      className="h-full bg-ink-900/20 dark:bg-ink-50/20"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </>
        )}
        {!branchLoading && branches?.length === 0 && (
          <p className="text-sm text-ink-400 font-sans">No branch data for this period.</p>
        )}
      </div>
    </div>
  );
}
