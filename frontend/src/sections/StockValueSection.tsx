import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useInventoryValue } from '@/hooks/useInventoryValue';
import { useSalesByPeriod } from '@/hooks/useSalesByPeriod';
import { SkeletonLine } from '@/components/ui/Skeleton';
import { fmtCurrency, fmtNumber } from '@/lib/format';
import api from '@/lib/api';
import type { PaginatedResponse, Transfer } from '@/types/api';
import type { LowStockItem } from '@/types/api';
import { useThemeStore } from '@/stores/theme.store';

function usePendingCount() {
  return useQuery({
    queryKey: ['transfers', 'pending-count'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Transfer>>('/transfers', {
        params: { status: 'PENDING_APPROVAL', limit: 1, page: 1 },
      });
      return data.total;
    },
  });
}

function useLowStockCount() {
  return useQuery({
    queryKey: ['reports', 'low-stock-count'],
    queryFn: async () => {
      const { data } = await api.get<LowStockItem[]>('/reports/low-stock', {
        params: { minQuantity: 10 },
      });
      return data.length;
    },
  });
}

function Sparkline({ data }: { data: Array<{ period: string; totalRevenue: number }> }) {
  const { dark } = useThemeStore();
  const ink = dark ? '#f0ede9' : '#1a1917';

  if (data.length === 0) {
    return <div className="h-12 border-b border-ink-900/10 dark:border-ink-50/10 opacity-20" />;
  }

  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ink} stopOpacity={0.15} />
            <stop offset="100%" stopColor={ink} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="totalRevenue"
          stroke={ink}
          strokeWidth={1.5}
          fill="url(#sparkFill)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function MetricStack({
  label,
  subline,
  value,
  loading,
}: {
  label: string;
  subline: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="py-4 border-b border-ink-900/10 dark:border-ink-50/10 last:border-0">
      <p className="eyebrow text-ink-400 dark:text-ink-500">{label}</p>
      <p className="text-xs font-sans text-ink-400 dark:text-ink-600 mt-0.5 mb-2">{subline}</p>
      {loading ? (
        <SkeletonLine className="h-6 w-16" />
      ) : (
        <p className="font-serif text-2xl font-medium text-ink-900 dark:text-ink-50 leading-none tabular-nums">
          {value}
        </p>
      )}
    </div>
  );
}

export function StockValueSection() {
  const { data: inv, isLoading: invLoading } = useInventoryValue();
  const { data: sparkData } = useSalesByPeriod();
  const { data: pendingCount, isLoading: pendLoading } = usePendingCount();
  const { data: lowStockCount, isLoading: lowLoading } = useLowStockCount();

  return (
    <section className="border-b border-ink-900/10 dark:border-ink-50/10">
      <div className="flex divide-x divide-ink-900/10 dark:divide-ink-50/10">
        {/* Left — stock value + sparkline (~2/3) */}
        <div className="flex-[2] px-8 py-8">
          <div className="flex items-start justify-between mb-4">
            <p className="eyebrow text-ink-400 dark:text-ink-500">STOCK VALUE · ALL LOCATIONS</p>
            <p className="text-xs font-sans text-ink-400 dark:text-ink-600">Last 13 weeks</p>
          </div>
          {invLoading ? (
            <SkeletonLine className="h-12 w-48 mb-4" />
          ) : (
            <p className="font-serif text-5xl font-medium text-ink-900 dark:text-ink-50 leading-none mb-1">
              {fmtCurrency(inv?.totalSellingValue)}
            </p>
          )}
          {!invLoading && inv && (
            <p className="text-xs font-sans text-ink-400 dark:text-ink-500 mb-6">
              Cost basis {fmtCurrency(inv.totalCostValue)}
            </p>
          )}
          {invLoading && <div className="mb-6" />}
          <Sparkline data={sparkData ?? []} />
        </div>

        {/* Right — 3 stacked metrics (~1/3) */}
        <div className="flex-1 px-8 py-8 flex flex-col justify-between">
          <MetricStack
            label="ACTIVE SKUS"
            subline="distinct products on hand"
            value={fmtNumber(inv?.distinctProducts)}
            loading={invLoading}
          />
          <MetricStack
            label="PENDING TRANSFERS"
            subline="awaiting approval"
            value={pendingCount != null ? String(pendingCount) : '—'}
            loading={pendLoading}
          />
          <MetricStack
            label="LOW STOCK ALERTS"
            subline="below threshold"
            value={lowStockCount != null ? String(lowStockCount) : '—'}
            loading={lowLoading}
          />
        </div>
      </div>
    </section>
  );
}
