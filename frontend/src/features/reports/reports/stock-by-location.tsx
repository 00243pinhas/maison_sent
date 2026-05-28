import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { PaginatedResponse, Location } from '@/types/api';
import { SkeletonLine } from '@/components/ui/Skeleton';
import { EditorialSelect } from '@/components/ui/editorial-select';
import { fmtCurrency } from '@/lib/format';
import { ReportHeader } from '../components/report-header';
import { EmptyReport } from '../components/empty-report';
import { ErrorReport } from '../components/error-report';
import { useStockByLocationReport } from '../hooks/use-stock-by-location';

function useLocationOptions() {
  return useQuery({
    queryKey: ['locations', 'options'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Location>>('/locations', {
        params: { limit: 100 },
      });
      return data.data;
    },
    staleTime: Infinity,
  });
}

export function StockByLocationReport() {
  const [locationId, setLocationId] = useState('');
  const { data: locations = [] } = useLocationOptions();
  const { data, isLoading, isError, refetch } = useStockByLocationReport(locationId);

  const locationOptions = [
    { value: '', label: 'Select a location…' },
    ...locations.map((l) => ({ value: l.id, label: l.name })),
  ];

  const selectedName = locations.find((l) => l.id === locationId)?.name;

  return (
    <div className="px-8 py-8">
      <ReportHeader
        title="Stock by Location"
        subline={selectedName ? `Showing stock at ${selectedName}` : 'Select a location to view its stock'}
        filter={
          <EditorialSelect
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            options={locationOptions}
            className="w-52"
          />
        }
      />
      {!locationId && <EmptyReport headline="No location selected" subline="Choose a location from the selector above." />}
      {locationId && isLoading && <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <SkeletonLine key={i} className="h-9 w-full" />)}</div>}
      {locationId && isError && <ErrorReport onRetry={refetch} />}
      {locationId && !isLoading && !isError && data?.length === 0 && <EmptyReport headline="No stock at this location" subline="Receive inventory here to see it listed." />}
      {locationId && !isLoading && !isError && data && data.length > 0 && (
        <table className="w-full">
          <thead>
            <tr>
              {['Product', 'SKU', 'Brand', 'Size', 'Qty', 'Cost value', 'Selling value'].map((h, i) => (
                <th key={h} className={`eyebrow text-ink-400 dark:text-ink-500 pb-3 pr-6 border-b border-ink-900/15 dark:border-ink-50/15 font-sans font-medium ${i >= 4 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.productId} className="hover:bg-ink-900/[0.02] dark:hover:bg-ink-50/[0.02]">
                <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans font-medium text-ink-900 dark:text-ink-100">{item.productName}</td>
                <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 font-mono text-xs text-ink-400">{item.sku}</td>
                <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans text-ink-500 dark:text-ink-400">{item.brand}</td>
                <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans text-ink-400 dark:text-ink-500">{item.sizeMl}ml</td>
                <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-right text-sm font-sans tabular-nums text-ink-900 dark:text-ink-100">{(item.quantity as number).toLocaleString()}</td>
                <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-right text-sm font-sans tabular-nums text-ink-500 dark:text-ink-400">{fmtCurrency(item.costValue)}</td>
                <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-right text-sm font-sans font-medium tabular-nums text-ink-900 dark:text-ink-100">{fmtCurrency(item.sellingValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
