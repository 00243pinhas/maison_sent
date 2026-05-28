import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Product, PaginatedResponse, Category, Supplier } from '@/types/api';
import { useProducts } from '../hooks/use-products';
import { useCanManage } from '@/lib/hooks/use-can-manage';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar } from '@/components/ui/filter-bar';
import { SearchInput } from '@/components/ui/search-input';
import { EditorialSelect } from '@/components/ui/editorial-select';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { SideSheet } from '@/components/ui/side-sheet';
import { ProductForm } from '../components/product-form';
import { fmtCurrency } from '@/lib/format';

const STATUS_FILTER_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'DISCONTINUED', label: 'Discontinued' },
];

function EmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="text-center">
      <p className="font-serif text-2xl font-medium text-ink-900 dark:text-ink-50 mb-2">
        No products yet
      </p>
      <p className="text-sm font-sans text-ink-400 dark:text-ink-500 mb-6">
        Add your first product to start managing inventory.
      </p>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="h-9 px-5 border border-ink-900/20 dark:border-ink-50/20 font-sans text-sm font-medium text-ink-900 dark:text-ink-50 hover:bg-ink-900/5 dark:hover:bg-ink-50/5 transition-colors"
        >
          + Add the first product
        </button>
      )}
    </div>
  );
}

export function ProductsPage() {
  const canManage = useCanManage('products');
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [status, setStatus] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Handle ?new=true and ?search= URL params set by command palette
  useEffect(() => {
    const newParam = searchParams.get('new');
    const searchParam = searchParams.get('search');
    if (newParam === 'true') {
      setSheetOpen(true);
      setSearchParams({}, { replace: true });
    } else if (searchParam) {
      setSearch(searchParam);
      setSearchParams({}, { replace: true });
    }
    // run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => { setPage(1); }, [debouncedSearch, categoryId, supplierId, status]);

  const { data, isLoading } = useProducts({
    page,
    limit: 20,
    search: debouncedSearch || undefined,
    categoryId: categoryId || undefined,
    supplierId: supplierId || undefined,
    status: status || undefined,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'options'],
    queryFn: async () => {
      const { data: res } = await api.get<PaginatedResponse<Category>>('/categories', {
        params: { limit: 100 },
      });
      return res.data;
    },
    staleTime: Infinity,
  });

  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers', 'options'],
    queryFn: async () => {
      const { data: res } = await api.get<PaginatedResponse<Supplier>>('/suppliers', {
        params: { limit: 100 },
      });
      return res.data;
    },
    staleTime: Infinity,
  });

  function openCreate() { setEditProduct(null); setSheetOpen(true); }
  function openEdit(product: Product) { setEditProduct(product); setSheetOpen(true); }
  function closeSheet() { setSheetOpen(false); setEditProduct(null); }

  const columns: Column<Product>[] = [
    { key: 'name', header: 'NAME', accessor: (p) => p.name, width: '22%' },
    { key: 'brand', header: 'BRAND', accessor: (p) => p.brand, width: '14%' },
    {
      key: 'sku',
      header: 'SKU',
      accessor: (p) => <span className="font-mono text-xs tabular-nums">{p.sku}</span>,
      width: '13%',
    },
    {
      key: 'category',
      header: 'CATEGORY',
      accessor: (p) => p.category?.name ?? '—',
      width: '13%',
    },
    {
      key: 'sizeMl',
      header: 'SIZE',
      accessor: (p) => `${p.sizeMl} ml`,
      align: 'right',
      width: '8%',
    },
    {
      key: 'costPrice',
      header: 'COST',
      accessor: (p) => fmtCurrency(p.costPrice),
      align: 'right',
      width: '10%',
    },
    {
      key: 'sellingPrice',
      header: 'SELLING',
      accessor: (p) => fmtCurrency(p.sellingPrice),
      align: 'right',
      width: '10%',
    },
    {
      key: 'status',
      header: 'STATUS',
      accessor: (p) => <span className="eyebrow text-ink-500 dark:text-ink-400">{p.status}</span>,
      width: '10%',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        subline={data ? `${data.total} products` : undefined}
        action={
          canManage ? (
            <button
              type="button"
              onClick={openCreate}
              className="h-9 px-5 bg-ink-900 dark:bg-ink-50 text-white dark:text-ink-900 font-sans font-medium text-sm hover:opacity-90 transition-opacity"
            >
              + Add product
            </button>
          ) : undefined
        }
      />

      <FilterBar>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, brand, or SKU"
        />
        <EditorialSelect
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          placeholder="All categories"
          options={(categoriesData ?? []).map((c) => ({ value: c.id, label: c.name }))}
          className="min-w-36"
        />
        <EditorialSelect
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          placeholder="All suppliers"
          options={(suppliersData ?? []).map((s) => ({ value: s.id, label: s.name }))}
          className="min-w-36"
        />
        <EditorialSelect
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder="All statuses"
          options={STATUS_FILTER_OPTIONS}
          className="min-w-28"
        />
      </FilterBar>

      <div className="px-8 py-6">
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          onRowClick={openEdit}
          isLoading={isLoading}
          emptyState={
            <EmptyState onAdd={canManage ? openCreate : undefined} />
          }
        />
        {data && (
          <Pagination page={page} limit={20} total={data.total} onPageChange={setPage} />
        )}
      </div>

      <SideSheet
        open={sheetOpen}
        onClose={closeSheet}
        title={editProduct ? 'Edit product' : 'New product'}
      >
        <ProductForm
          initialData={editProduct ?? undefined}
          onClose={closeSheet}
          disabled={!canManage}
        />
      </SideSheet>
    </div>
  );
}
