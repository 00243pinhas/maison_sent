import { SkeletonLine, Skeleton } from '@/components/ui/Skeleton';
import { ErrorBox } from '@/components/ui/ErrorBox';
import { fmtCurrency, fmtNumber } from '@/lib/format';
import { getMovementLabel } from '@/lib/utils/movement-display';
import { useReportInventoryValue, useReportMovementSummary } from '../hooks/use-report-queries';
import type { DatePreset } from '../hooks/use-report-queries';
import type { MovementType } from '@/types/api';

interface OverviewTabProps {
  preset: DatePreset;
}

export function OverviewTab({ preset }: OverviewTabProps) {
  const { data: inv, isLoading: invLoading, isError: invError } = useReportInventoryValue();
  const {
    data: summary,
    isLoading: sumLoading,
    isError: sumError,
  } = useReportMovementSummary(preset);

  const maxTxns = summary?.length
    ? Math.max(...summary.map((s) => parseInt(s.transactionCount) || 0))
    : 0;

  return (
    <div className="space-y-10">
      {/* Inventory value */}
      <div>
        <p className="eyebrow text-ink-400 dark:text-ink-500 mb-4">Current Inventory Value</p>
        {invError && <ErrorBox message="Could not load inventory value." />}
        {invLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-48" />
            <SkeletonLine className="h-4 w-32" />
          </div>
        ) : inv ? (
          <div>
            <p className="font-serif text-5xl font-medium text-ink-900 dark:text-ink-50 leading-none">
              {fmtCurrency(inv.totalSellingValue)}
            </p>
            <p className="text-sm font-sans text-ink-400 dark:text-ink-500 mt-2">
              Cost basis {fmtCurrency(inv.totalCostValue)}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px mt-6 bg-ink-900/10 dark:bg-ink-50/10 border border-ink-900/10 dark:border-ink-50/10">
              {[
                { label: 'Total Units', value: fmtNumber(inv.totalUnits) },
                { label: 'Distinct Products', value: fmtNumber(inv.distinctProducts) },
                { label: 'Locations', value: fmtNumber(inv.distinctLocations) },
                {
                  label: 'Avg Unit Value',
                  value:
                    inv.totalSellingValue && inv.totalUnits
                      ? fmtCurrency(
                          parseFloat(inv.totalSellingValue) / parseFloat(inv.totalUnits),
                        )
                      : '—',
                },
              ].map(({ label, value }) => (
                <div key={label} className="p-5 bg-ink-50 dark:bg-ink-900">
                  <p className="eyebrow text-ink-400 dark:text-ink-500 mb-2">{label}</p>
                  <p className="font-serif text-xl font-medium text-ink-900 dark:text-ink-50">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Movement summary */}
      <div>
        <p className="eyebrow text-ink-400 dark:text-ink-500 mb-4">Movement Breakdown</p>
        {sumError && <ErrorBox message="Could not load movement summary." />}
        {sumLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonLine key={i} className="h-9 w-full" />
            ))}
          </div>
        )}
        {!sumLoading && summary && summary.length > 0 && (
          <div>
            <div className="grid grid-cols-[1fr_100px_100px] gap-4 pb-2 border-b border-ink-900/15 dark:border-ink-50/15">
              <p className="eyebrow text-ink-400 dark:text-ink-500">Type</p>
              <p className="eyebrow text-ink-400 dark:text-ink-500 text-right">Transactions</p>
              <p className="eyebrow text-ink-400 dark:text-ink-500 text-right">Units</p>
            </div>
            {summary.map((row) => {
              const txns = parseInt(row.transactionCount) || 0;
              const barPct = maxTxns > 0 ? (txns / maxTxns) * 100 : 0;
              return (
                <div
                  key={row.movementType}
                  className="border-b border-ink-900/10 dark:border-ink-50/10 last:border-0"
                >
                  <div className="grid grid-cols-[1fr_100px_100px] gap-4 py-3 items-center">
                    <p className="text-sm font-sans text-ink-900 dark:text-ink-100">
                      {getMovementLabel(row.movementType as MovementType)}
                    </p>
                    <p className="text-sm font-sans text-ink-900 dark:text-ink-100 text-right tabular-nums">
                      {fmtNumber(row.transactionCount)}
                    </p>
                    <p className="text-sm font-sans text-ink-900 dark:text-ink-100 text-right tabular-nums">
                      {fmtNumber(row.totalQuantity)}
                    </p>
                  </div>
                  <div className="h-0.5 bg-ink-900/5 dark:bg-ink-50/5">
                    <div
                      className="h-full bg-ink-900/20 dark:bg-ink-50/20 transition-all"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!sumLoading && summary?.length === 0 && (
          <p className="text-sm text-ink-400 font-sans">No movements in this period.</p>
        )}
      </div>
    </div>
  );
}
