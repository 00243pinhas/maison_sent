import { useNavigate } from 'react-router-dom';
import { DataTable, type Column } from '@/components/ui/data-table';
import { TransferStatusLabel } from './transfer-status-label';
import { fmtDate } from '@/lib/format';
import type { Transfer } from '@/types/api';

function EmptyTransfers() {
  const navigate = useNavigate();
  return (
    <div className="text-center">
      <p className="font-serif text-2xl font-medium text-ink-900 dark:text-ink-50 mb-2">
        No transfers yet
      </p>
      <p className="text-sm font-sans text-ink-400 dark:text-ink-500 mb-6">
        Use + New transfer to plan a stock movement between locations.
      </p>
      <button
        type="button"
        onClick={() => navigate('/transfers/new')}
        className="h-9 px-5 border border-ink-900/20 dark:border-ink-50/20 font-sans text-sm font-medium text-ink-900 dark:text-ink-50 hover:bg-ink-900/5 dark:hover:bg-ink-50/5 transition-colors"
      >
        + New transfer
      </button>
    </div>
  );
}

const columns: Column<Transfer>[] = [
  {
    key: 'status',
    header: 'Status',
    width: '160px',
    accessor: (t) => <TransferStatusLabel status={t.status} />,
  },
  {
    key: 'reference',
    header: 'Reference',
    width: '140px',
    accessor: (t) =>
      t.referenceNumber ? (
        <span className="font-mono text-xs text-ink-500 dark:text-ink-400">
          #{t.referenceNumber}
        </span>
      ) : (
        <span className="text-ink-300 dark:text-ink-600">—</span>
      ),
  },
  {
    key: 'route',
    header: 'Route',
    accessor: (t) => (
      <span className="text-sm font-sans text-ink-900 dark:text-ink-100">
        {t.fromLocation.name}
        <span className="text-ink-300 dark:text-ink-600 mx-1.5">→</span>
        {t.toLocation.name}
      </span>
    ),
  },
  {
    key: 'items',
    header: 'Items',
    width: '80px',
    align: 'right',
    accessor: (t) =>
      t.items !== undefined ? (
        <span className="tabular-nums">{t.items.length}</span>
      ) : (
        <span className="text-ink-300 dark:text-ink-600">—</span>
      ),
  },
  {
    key: 'date',
    header: 'Created',
    width: '120px',
    accessor: (t) => (
      <span className="text-ink-400 dark:text-ink-500">{fmtDate(t.createdAt)}</span>
    ),
  },
];

interface TransfersTableProps {
  data: Transfer[];
  isLoading?: boolean;
}

export function TransfersTable({ data, isLoading }: TransfersTableProps) {
  const navigate = useNavigate();
  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      onRowClick={(t) => navigate(`/transfers/${t.id}`)}
      emptyState={<EmptyTransfers />}
    />
  );
}
