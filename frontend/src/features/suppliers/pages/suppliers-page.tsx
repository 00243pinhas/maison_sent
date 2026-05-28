import { useState, useMemo, useEffect } from 'react';
import type { Supplier } from '@/types/api';
import { useSuppliers } from '../hooks/use-suppliers';
import { useCanManage } from '@/lib/hooks/use-can-manage';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { SearchInput } from '@/components/ui/search-input';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { SideSheet } from '@/components/ui/side-sheet';
import { SupplierForm } from '../components/supplier-form';

const LIMIT = 20;

function EmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="text-center">
      <p className="font-serif text-2xl font-medium text-ink-900 dark:text-ink-50 mb-2">
        No suppliers yet
      </p>
      <p className="text-sm font-sans text-ink-400 dark:text-ink-500 mb-6">
        Add a supplier to link products to their source.
      </p>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="h-9 px-5 border border-ink-900/20 dark:border-ink-50/20 font-sans text-sm font-medium text-ink-900 dark:text-ink-50 hover:bg-ink-900/5 dark:hover:bg-ink-50/5 transition-colors"
        >
          + Add the first supplier
        </button>
      )}
    </div>
  );
}

export function SuppliersPage() {
  const canManage = useCanManage('suppliers');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading } = useSuppliers({ limit: 100 });

  const filtered = useMemo(() => {
    const all = data?.data ?? [];
    if (!debouncedSearch) return all;
    const q = debouncedSearch.toLowerCase();
    return all.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.country ?? '').toLowerCase().includes(q) ||
        (s.email ?? '').toLowerCase().includes(q),
    );
  }, [data, debouncedSearch]);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const total = filtered.length;
  const pageData = useMemo(() => {
    const start = (page - 1) * LIMIT;
    return filtered.slice(start, start + LIMIT);
  }, [filtered, page]);

  function openCreate() { setEditSupplier(null); setSheetOpen(true); }
  function openEdit(supplier: Supplier) { setEditSupplier(supplier); setSheetOpen(true); }
  function closeSheet() { setSheetOpen(false); setEditSupplier(null); }

  const columns: Column<Supplier>[] = [
    { key: 'name', header: 'NAME', accessor: (s) => s.name, width: '30%' },
    { key: 'country', header: 'COUNTRY', accessor: (s) => s.country ?? '—', width: '20%' },
    { key: 'phone', header: 'PHONE', accessor: (s) => s.phone ?? '—', width: '20%' },
    { key: 'email', header: 'EMAIL', accessor: (s) => s.email ?? '—', width: '30%' },
  ];

  return (
    <div>
      <PageHeader
        title="Suppliers"
        subline={data ? `${total} suppliers` : undefined}
        action={
          canManage ? (
            <button
              type="button"
              onClick={openCreate}
              className="h-9 px-5 bg-ink-900 dark:bg-ink-50 text-white dark:text-ink-900 font-sans font-medium text-sm hover:opacity-90 transition-opacity"
            >
              + Add supplier
            </button>
          ) : undefined
        }
      />

      <FilterBar>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, country, or email"
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
        title={editSupplier ? 'Edit supplier' : 'New supplier'}
      >
        <SupplierForm
          initialData={editSupplier ?? undefined}
          onClose={closeSheet}
          disabled={!canManage}
        />
      </SideSheet>
    </div>
  );
}
