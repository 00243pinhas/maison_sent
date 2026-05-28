import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FilterBar } from '@/components/ui/filter-bar';
import { SearchInput } from '@/components/ui/search-input';
import { EditorialSelect } from '@/components/ui/editorial-select';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { useLocations } from '@/features/locations/hooks/use-locations';
import { useBalances } from '../hooks/use-balances';
import type { InventoryBalance } from '@/types/api';

const LIMIT = 20;
const LOW_STOCK_THRESHOLD = 20;

function EmptyState() {
  return (
    <div className="text-center">
      <p className="font-serif text-2xl font-medium text-ink-900 dark:text-ink-50 mb-2">
        No stock recorded yet
      </p>
      <p className="text-sm font-sans text-ink-400 dark:text-ink-500">
        Use + Receive to bring stock into a location.
      </p>
    </div>
  );
}

export function BalancesView() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [locationId, setLocationId] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => { setPage(1); }, [debouncedSearch, locationId, showLowStock]);

  const { data: locationsData } = useLocations({ limit: 100 });
  const locationOptions = [
    { value: '', label: 'All locations' },
    ...(locationsData?.data ?? []).map((l) => ({ value: l.id, label: l.name })),
  ];

  const query = {
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    locationId: locationId || undefined,
    maxQuantity: showLowStock ? LOW_STOCK_THRESHOLD - 1 : undefined,
  };

  const { data, isLoading } = useBalances(query);

  const columns: Column<InventoryBalance>[] = [
    {
      key: 'product',
      header: 'PRODUCT',
      accessor: (row) => (
        <div>
          <p className="text-sm font-sans font-medium text-ink-900 dark:text-ink-50">
            {row.product.name}
          </p>
          <p className="text-xs font-sans text-ink-400 dark:text-ink-500">
            {row.product.brand} · {row.product.sku}
          </p>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'LOCATION',
      accessor: (row) => row.location.name,
    },
    {
      key: 'size',
      header: 'SIZE',
      accessor: (row) => `${row.product.sizeMl} ml`,
      align: 'right',
    },
    {
      key: 'quantity',
      header: 'QUANTITY',
      accessor: (row) => (
        <span className="flex items-center gap-2 justify-end">
          {row.quantity.toLocaleString()}
          {row.quantity < LOW_STOCK_THRESHOLD && (
            <span className="eyebrow text-ink-400 dark:text-ink-500">low stock</span>
          )}
        </span>
      ),
      align: 'right',
    },
    {
      key: 'updatedAt',
      header: 'UPDATED',
      accessor: (row) =>
        formatDistanceToNow(new Date(row.updatedAt), { addSuffix: true }),
      align: 'right',
    },
  ];

  return (
    <div>
      <FilterBar>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by product name"
        />
        <EditorialSelect
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          options={locationOptions}
          className="min-w-40"
        />
        <button
          type="button"
          onClick={() => setShowLowStock((v) => !v)}
          className={`text-sm font-sans transition-colors ${
            showLowStock
              ? 'font-medium text-ink-900 dark:text-ink-50'
              : 'font-normal text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-300'
          }`}
        >
          {showLowStock ? '✓ ' : ''}Low stock only
        </button>
      </FilterBar>

      <div className="px-8 py-6">
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          emptyState={<EmptyState />}
        />
        {data && data.total > LIMIT && (
          <Pagination
            page={page}
            limit={LIMIT}
            total={data.total}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
