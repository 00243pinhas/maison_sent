import { fmtDate } from '@/lib/format';
import { Skeleton } from '@/components/ui/Skeleton';
import { ReportHeader } from '../components/report-header';
import { ErrorReport } from '../components/error-report';
import { useInventoryValueReport } from '../hooks/use-inventory-value-report';

function Stat({ label, value, serif }: { label: string; value: string; serif?: boolean }) {
  return (
    <div className="border-b border-ink-900/10 dark:border-ink-50/10 py-5">
      <dt className="eyebrow text-ink-400 dark:text-ink-500 mb-2">{label}</dt>
      <dd className={serif
        ? 'font-serif text-4xl font-medium text-ink-900 dark:text-ink-50'
        : 'font-serif text-2xl font-medium text-ink-500 dark:text-ink-400'
      }>{value}</dd>
    </div>
  );
}

export function InventoryValueReport() {
  const { data, isLoading, isError, refetch } = useInventoryValueReport();

  return (
    <div className="px-8 py-8">
      <ReportHeader
        title="Inventory Value"
        subline={`As of ${fmtDate(new Date())}`}
      />
      {isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-12 w-56" />
          <Skeleton className="h-12 w-44" />
        </div>
      )}
      {isError && <ErrorReport onRetry={refetch} />}
      {data && (
        <dl className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 max-w-xl">
          <Stat label="Selling basis" value={data.totalSellingValue ?? '—'} serif />
          <Stat label="Cost basis" value={data.totalCostValue ?? '—'} />
          <Stat label="Total units" value={data.totalUnits ?? '—'} />
          <Stat label="Distinct products" value={data.distinctProducts ?? '—'} />
          <Stat label="Locations tracked" value={data.distinctLocations ?? '—'} />
        </dl>
      )}
    </div>
  );
}
