import { format } from 'date-fns';
import { useBranchPerformance } from '@/hooks/useBranchPerformance';
import { SkeletonLine } from '@/components/ui/Skeleton';
import { fmtCurrency } from '@/lib/format';

export function BranchPerformanceSection() {
  const { data, isLoading, isError } = useBranchPerformance();

  const totalRevenue = data?.reduce((sum, b) => sum + (parseFloat(b.totalRevenue) || 0), 0) ?? 0;
  const month = format(new Date(), 'MMMM').toUpperCase();

  return (
    <section className="px-8 py-8 border-t border-ink-900/10 dark:border-ink-50/10">
      <div className="flex items-baseline justify-between mb-6">
        <p className="eyebrow text-ink-900 dark:text-ink-50">
          <span className="opacity-40">05</span> BRANCH PERFORMANCE · {month}
        </p>
        <p className="text-xs font-sans text-ink-400 dark:text-ink-500">Month to date</p>
      </div>

      {isError && (
        <p className="text-sm font-sans text-ink-400 dark:text-ink-500 py-2">
          · Could not load branch performance
        </p>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink-900/10 dark:bg-ink-50/10 border border-ink-900/10 dark:border-ink-50/10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 bg-ink-50 dark:bg-ink-900">
              <SkeletonLine className="h-3.5 w-2/3 mb-3" />
              <SkeletonLine className="h-8 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink-900/10 dark:bg-ink-50/10 border border-ink-900/10 dark:border-ink-50/10">
          {data.map((branch) => {
            const revenue = parseFloat(branch.totalRevenue) || 0;
            const share = totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0;

            return (
              <div key={branch.locationId} className="p-5 bg-ink-50 dark:bg-ink-900">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="text-sm font-sans font-medium text-ink-900 dark:text-ink-100">
                      {branch.locationName}
                    </p>
                    <p className="eyebrow text-ink-400 dark:text-ink-500 mt-0.5">
                      {branch.locationType}
                    </p>
                  </div>
                  <span className="eyebrow text-ink-400 dark:text-ink-500">{share}%</span>
                </div>
                <p className="font-serif text-2xl font-medium text-ink-900 dark:text-ink-50 leading-none tabular-nums">
                  {fmtCurrency(branch.totalRevenue)}
                </p>
                <p className="text-xs font-sans text-ink-400 dark:text-ink-500 mt-1 tabular-nums">
                  {parseInt(branch.unitsSold as string).toLocaleString()} units ·{' '}
                  {branch.salesTransactions} txns
                </p>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && !isError && data?.length === 0 && (
        <p className="text-sm text-ink-400 font-sans py-2">No branch data this month.</p>
      )}
    </section>
  );
}
