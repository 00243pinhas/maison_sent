import { useState, useMemo, useEffect } from 'react';
import type { Location, LocationType } from '@/types/api';
import { useLocations } from '../hooks/use-locations';
import { useCanManage } from '@/lib/hooks/use-can-manage';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { SearchInput } from '@/components/ui/search-input';
import { EditorialSelect } from '@/components/ui/editorial-select';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { SideSheet } from '@/components/ui/side-sheet';
import { LocationForm } from '../components/location-form';

const LIMIT = 20;

const TYPE_FILTER_OPTIONS = [
  { value: 'WAREHOUSE', label: 'Warehouse' },
  { value: 'BRANCH', label: 'Branch' },
  { value: 'HEAD_OFFICE', label: 'Head Office' },
];

function EmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="text-center">
      <p className="font-serif text-2xl font-medium text-ink-900 dark:text-ink-50 mb-2">
        No locations yet
      </p>
      <p className="text-sm font-sans text-ink-400 dark:text-ink-500 mb-6">
        Add warehouses, branches, and offices to track inventory by location.
      </p>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="h-9 px-5 border border-ink-900/20 dark:border-ink-50/20 font-sans text-sm font-medium text-ink-900 dark:text-ink-50 hover:bg-ink-900/5 dark:hover:bg-ink-50/5 transition-colors"
        >
          + Add the first location
        </button>
      )}
    </div>
  );
}

const TYPE_LABEL: Record<LocationType, string> = {
  WAREHOUSE: 'Warehouse',
  BRANCH: 'Branch',
  HEAD_OFFICE: 'Head Office',
};

export function LocationsPage() {
  const canManage = useCanManage('locations');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editLocation, setEditLocation] = useState<Location | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading } = useLocations({ limit: 100 });

  const filtered = useMemo(() => {
    let all = data?.data ?? [];
    if (typeFilter) {
      all = all.filter((l) => l.type === typeFilter);
    }
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      all = all.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          (l.city ?? '').toLowerCase().includes(q),
      );
    }
    return all;
  }, [data, debouncedSearch, typeFilter]);

  useEffect(() => { setPage(1); }, [debouncedSearch, typeFilter]);

  const total = filtered.length;
  const pageData = useMemo(() => {
    const start = (page - 1) * LIMIT;
    return filtered.slice(start, start + LIMIT);
  }, [filtered, page]);

  function openCreate() { setEditLocation(null); setSheetOpen(true); }
  function openEdit(location: Location) { setEditLocation(location); setSheetOpen(true); }
  function closeSheet() { setSheetOpen(false); setEditLocation(null); }

  const columns: Column<Location>[] = [
    { key: 'name', header: 'NAME', accessor: (l) => l.name, width: '30%' },
    {
      key: 'type',
      header: 'TYPE',
      accessor: (l) => (
        <span className="eyebrow text-ink-500 dark:text-ink-400">
          {TYPE_LABEL[l.type]}
        </span>
      ),
      width: '20%',
    },
    { key: 'city', header: 'CITY', accessor: (l) => l.city ?? '—', width: '20%' },
    {
      key: 'address',
      header: 'ADDRESS',
      accessor: (l) => l.address ?? '—',
      width: '30%',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Locations"
        subline={data ? `${total} locations` : undefined}
        action={
          canManage ? (
            <button
              type="button"
              onClick={openCreate}
              className="h-9 px-5 bg-ink-900 dark:bg-ink-50 text-white dark:text-ink-900 font-sans font-medium text-sm hover:opacity-90 transition-opacity"
            >
              + Add location
            </button>
          ) : undefined
        }
      />

      <FilterBar>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or city"
        />
        <EditorialSelect
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          placeholder="All types"
          options={TYPE_FILTER_OPTIONS}
          className="min-w-36"
        />
      </FilterBar>

      <div className="px-8 py-6">
        <DataTable
          columns={columns}
          data={pageData}
          onRowClick={openEdit}
          isLoading={isLoading}
          emptyState={<EmptyState onAdd={canManage ? openCreate : undefined} />}
        />
        {total > LIMIT && (
          <Pagination page={page} limit={LIMIT} total={total} onPageChange={setPage} />
        )}
      </div>

      <SideSheet
        open={sheetOpen}
        onClose={closeSheet}
        title={editLocation ? 'Edit location' : 'New location'}
      >
        <LocationForm
          initialData={editLocation ?? undefined}
          onClose={closeSheet}
          disabled={!canManage}
        />
      </SideSheet>
    </div>
  );
}
