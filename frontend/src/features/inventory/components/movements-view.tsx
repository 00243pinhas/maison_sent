import { useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { FilterBar } from '@/components/ui/filter-bar';
import { EditorialSelect } from '@/components/ui/editorial-select';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { INPUT_BASE } from '@/components/ui/field';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { useLocations } from '@/features/locations/hooks/use-locations';
import { getMovementLabel, getMovementMarker, getMovementSignedQuantity, getMovementCounterparty } from '@/lib/utils/movement-display';
import { useMovements } from '../hooks/use-movements';
import { MovementDetail } from './movement-detail';
import { ProductPicker } from './product-picker';
import type { Movement, Product } from '@/types/api';

const LIMIT = 20;

const MOVEMENT_TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'SALE', label: 'Sale' },
  { value: 'RETURN', label: 'Return' },
  { value: 'DAMAGE', label: 'Damage' },
  { value: 'ADJUSTMENT_IN', label: 'Adjustment In' },
  { value: 'ADJUSTMENT_OUT', label: 'Adjustment Out' },
  { value: 'TRANSFER', label: 'Transfer' },
];

function EmptyState() {
  return (
    <div className="text-center">
      <p className="font-serif text-2xl font-medium text-ink-900 dark:text-ink-50 mb-2">
        No movements yet
      </p>
      <p className="text-sm font-sans text-ink-400 dark:text-ink-500">
        Movements appear as soon as stock is received, sold, returned, or transferred.
      </p>
    </div>
  );
}

function formatPerformer(user: { fullName: string } | null | undefined): string {
  if (!user?.fullName) return '—';
  const parts = user.fullName.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export function MovementsView() {
  const [page, setPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState('');
  const [movementType, setMovementType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [detailMovementId, setDetailMovementId] = useState<string | null>(null);

  const debouncedProductId = useDebouncedValue(selectedProductId, 300);
  const debouncedLocationId = useDebouncedValue(locationId, 300);
  const debouncedType = useDebouncedValue(movementType, 300);
  const debouncedFrom = useDebouncedValue(dateFrom, 300);
  const debouncedTo = useDebouncedValue(dateTo, 300);

  useEffect(() => { setPage(1); }, [debouncedProductId, debouncedLocationId, debouncedType, debouncedFrom, debouncedTo]);

  const { data: locationsData } = useLocations({ limit: 100 });
  const locationOptions = [
    { value: '', label: 'All locations' },
    ...(locationsData?.data ?? []).map((l) => ({ value: l.id, label: l.name })),
  ];

  const query = {
    page,
    limit: LIMIT,
    productId: debouncedProductId || undefined,
    locationId: debouncedLocationId || undefined,
    movementType: debouncedType || undefined,
    from: debouncedFrom || undefined,
    to: debouncedTo || undefined,
  };

  const { data, isLoading } = useMovements(query);

  const handleProductChange = useCallback((product: Product) => {
    setSelectedProductId(product.id);
  }, []);

  const columns: Column<Movement>[] = [
    {
      key: 'time',
      header: 'TIME',
      accessor: (row) => (
        <span className="text-xs font-sans text-ink-500 dark:text-ink-400">
          {format(new Date(row.createdAt), 'dd MMM yyyy · HH:mm')}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'TYPE',
      accessor: (row) => (
        <span className="eyebrow text-ink-400 dark:text-ink-500">
          {getMovementMarker(row.movementType)}{' '}
          {getMovementLabel(row.movementType)}
        </span>
      ),
    },
    {
      key: 'product',
      header: 'PRODUCT',
      accessor: (row) => row.product.name,
    },
    {
      key: 'route',
      header: 'FROM → TO',
      accessor: (row) => {
        const from = getMovementCounterparty(row, 'from');
        const to = getMovementCounterparty(row, 'to');
        return (
          <span className="text-sm font-sans text-ink-500 dark:text-ink-400">
            {from} → {to}
          </span>
        );
      },
    },
    {
      key: 'quantity',
      header: 'QTY',
      accessor: (row) => (
        <span className="font-sans text-sm font-medium tabular-nums">
          {getMovementSignedQuantity(row.quantity, row.movementType)}
        </span>
      ),
      align: 'right',
    },
    {
      key: 'by',
      header: 'BY',
      accessor: (row) => formatPerformer(row.performedBy),
    },
    {
      key: 'ref',
      header: 'REF',
      accessor: (row) =>
        row.referenceNumber ?? (
          <span className="text-ink-300 dark:text-ink-600">—</span>
        ),
    },
  ];

  return (
    <div>
      <FilterBar>
        <div className="min-w-52">
          <ProductPicker
            label="Filter by product"
            value={selectedProductId}
            onChange={handleProductChange}
          />
          {selectedProductId && (
            <button
              type="button"
              onClick={() => setSelectedProductId(null)}
              className="text-[11px] font-sans text-ink-400 hover:text-ink-700 dark:hover:text-ink-300 transition-colors mt-0.5"
            >
              Clear
            </button>
          )}
        </div>
        <EditorialSelect
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          options={locationOptions}
          className="min-w-36"
        />
        <EditorialSelect
          value={movementType}
          onChange={(e) => setMovementType(e.target.value)}
          options={MOVEMENT_TYPE_OPTIONS}
          className="min-w-36"
        />
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={`${INPUT_BASE} w-36`}
            placeholder="From"
          />
          <span className="text-ink-300 dark:text-ink-600 text-sm">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={`${INPUT_BASE} w-36`}
            placeholder="To"
          />
        </div>
      </FilterBar>

      <div className="px-8 py-6">
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          onRowClick={(row) => setDetailMovementId(row.id)}
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

      <MovementDetail
        movementId={detailMovementId}
        onClose={() => setDetailMovementId(null)}
      />
    </div>
  );
}
