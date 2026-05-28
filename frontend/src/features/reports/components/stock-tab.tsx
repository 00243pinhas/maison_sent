import { useState, useMemo } from 'react';
import { SkeletonLine } from '@/components/ui/Skeleton';
import { ErrorBox } from '@/components/ui/ErrorBox';
import { INPUT_BASE } from '@/components/ui/field';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { useReportLowStock } from '../hooks/use-report-queries';

export function StockTab() {
  const [search, setSearch] = useState('');
  const [maxQty, setMaxQty] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);

  const { data, isLoading, isError } = useReportLowStock();

  const filtered = useMemo(() => {
    if (!data) return [];
    const threshold = maxQty ? parseInt(maxQty, 10) : Infinity;
    return data.filter((item) => {
      const qty = parseInt(item.quantity);
      if (!isNaN(threshold) && qty > threshold) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        return (
          item.productName.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.locationName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data, debouncedSearch, maxQty]);

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-6 mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product, SKU, or location…"
          className={`${INPUT_BASE} max-w-xs`}
        />
        <div className="flex items-center gap-2">
          <label className="eyebrow text-ink-400 dark:text-ink-500 whitespace-nowrap">
            Max qty
          </label>
          <input
            type="number"
            min="0"
            value={maxQty}
            onChange={(e) => setMaxQty(e.target.value)}
            placeholder="All"
            className={`${INPUT_BASE} w-24`}
          />
        </div>
        {data && (
          <span className="eyebrow text-ink-400 dark:text-ink-500 ml-auto">
            {filtered.length} of {data.length}
          </span>
        )}
      </div>

      {isError && <ErrorBox message="Could not load stock data." />}

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <SkeletonLine className="h-3.5 w-1/2" />
              <SkeletonLine className="h-3.5 w-28" />
              <SkeletonLine className="h-3.5 w-16" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="w-full overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Product', 'SKU', 'Location', 'Quantity'].map((h, i) => (
                  <th
                    key={h}
                    className={`eyebrow text-ink-400 dark:text-ink-500 pb-3 pr-6 border-b border-ink-900/15 dark:border-ink-50/15 font-sans font-medium ${
                      i === 3 ? 'text-right' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const qty = parseInt(item.quantity);
                const isCritical = qty === 0;
                return (
                  <tr
                    key={`${item.productId}-${item.locationId}`}
                    className="hover:bg-ink-900/[0.02] dark:hover:bg-ink-50/[0.02] transition-colors"
                  >
                    <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans font-medium text-ink-900 dark:text-ink-100 max-w-[200px] truncate">
                      {item.productName}
                    </td>
                    <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10">
                      <span className="font-mono text-xs text-ink-400 dark:text-ink-500">
                        {item.sku}
                      </span>
                    </td>
                    <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans text-ink-500 dark:text-ink-400">
                      {item.locationName}
                    </td>
                    <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-right">
                      <span
                        className={`text-sm font-sans font-medium tabular-nums ${
                          isCritical
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-ink-900 dark:text-ink-100'
                        }`}
                      >
                        {qty.toLocaleString()}
                      </span>
                      {isCritical && (
                        <span className="eyebrow text-red-500 dark:text-red-400 ml-2">
                          out of stock
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && filtered.length === 0 && !isError && (
        <p className="text-sm text-ink-400 font-sans py-8 text-center">
          {data?.length === 0
            ? 'All stock levels are healthy.'
            : 'No items match the current filters.'}
        </p>
      )}
    </div>
  );
}
