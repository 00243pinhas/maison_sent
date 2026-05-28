import { useState, useMemo, useEffect } from 'react';
import type { Category } from '@/types/api';
import { useCategories } from '../hooks/use-categories';
import { useCanManage } from '@/lib/hooks/use-can-manage';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { SearchInput } from '@/components/ui/search-input';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { SideSheet } from '@/components/ui/side-sheet';
import { CategoryForm } from '../components/category-form';

const LIMIT = 20;

function EmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="text-center">
      <p className="font-serif text-2xl font-medium text-ink-900 dark:text-ink-50 mb-2">
        No categories yet
      </p>
      <p className="text-sm font-sans text-ink-400 dark:text-ink-500 mb-6">
        Add a category to start classifying your products.
      </p>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="h-9 px-5 border border-ink-900/20 dark:border-ink-50/20 font-sans text-sm font-medium text-ink-900 dark:text-ink-50 hover:bg-ink-900/5 dark:hover:bg-ink-50/5 transition-colors"
        >
          + Add the first category
        </button>
      )}
    </div>
  );
}

export function CategoriesPage() {
  const canManage = useCanManage('categories');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading } = useCategories({ limit: 100 });

  const filtered = useMemo(() => {
    const all = data?.data ?? [];
    if (!debouncedSearch) return all;
    const q = debouncedSearch.toLowerCase();
    return all.filter((c) => c.name.toLowerCase().includes(q));
  }, [data, debouncedSearch]);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const total = filtered.length;
  const pageData = useMemo(() => {
    const start = (page - 1) * LIMIT;
    return filtered.slice(start, start + LIMIT);
  }, [filtered, page]);

  function openCreate() { setEditCategory(null); setSheetOpen(true); }
  function openEdit(cat: Category) { setEditCategory(cat); setSheetOpen(true); }
  function closeSheet() { setSheetOpen(false); setEditCategory(null); }

  const columns: Column<Category>[] = [
    { key: 'name', header: 'NAME', accessor: (c) => c.name, width: '60%' },
    {
      key: 'createdAt',
      header: 'CREATED',
      accessor: (c) => new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      width: '40%',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Categories"
        subline={data ? `${total} categories` : undefined}
        action={
          canManage ? (
            <button
              type="button"
              onClick={openCreate}
              className="h-9 px-5 bg-ink-900 dark:bg-ink-50 text-white dark:text-ink-900 font-sans font-medium text-sm hover:opacity-90 transition-opacity"
            >
              + Add category
            </button>
          ) : undefined
        }
      />

      <FilterBar>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search categories"
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
        title={editCategory ? 'Edit category' : 'New category'}
      >
        <CategoryForm
          initialData={editCategory ?? undefined}
          onClose={closeSheet}
          disabled={!canManage}
        />
      </SideSheet>
    </div>
  );
}
