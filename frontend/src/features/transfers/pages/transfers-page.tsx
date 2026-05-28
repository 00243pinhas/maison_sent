import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { EditorialSelect } from '@/components/ui/editorial-select';
import { INPUT_BASE } from '@/components/ui/field';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { useTransfers } from '../hooks/use-transfers';
import { TransfersTable } from '../components/transfers-table';
import type { TransferStatus } from '@/types/api';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const PAGE_SIZE = 20;

export function TransfersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TransferStatus | ''>('');
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading } = useTransfers({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: status || undefined,
  });

  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  function setPage(p: number) {
    setSearchParams({ page: String(p) }, { replace: true });
  }

  return (
    <div>
      <PageHeader
        title="Transfers"
        subline={
          !isLoading && data ? `${total.toLocaleString()} transfer${total !== 1 ? 's' : ''}` : undefined
        }
        action={
          <button
            type="button"
            onClick={() => navigate('/transfers/new')}
            className="flex items-center gap-2 h-9 px-4 bg-ink-900 dark:bg-ink-50 text-white dark:text-ink-900 font-sans font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={14} strokeWidth={1.5} />
            New transfer
          </button>
        }
      />

      {/* Filters */}
      <div className="px-8 py-4 border-b border-ink-900/10 dark:border-ink-50/10 flex items-center gap-6">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by reference or location…"
          className={`${INPUT_BASE} max-w-xs`}
        />
        <EditorialSelect
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as TransferStatus | '');
            setPage(1);
          }}
          options={STATUS_OPTIONS}
          className="w-44"
        />
      </div>

      <div className="px-8 py-6">
        <TransfersTable data={data?.data ?? []} isLoading={isLoading} />

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-ink-900/10 dark:border-ink-50/10">
            <p className="text-sm font-sans text-ink-400 dark:text-ink-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="text-sm font-sans text-ink-400 dark:text-ink-500 hover:text-ink-900 dark:hover:text-ink-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="text-sm font-sans text-ink-400 dark:text-ink-500 hover:text-ink-900 dark:hover:text-ink-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
