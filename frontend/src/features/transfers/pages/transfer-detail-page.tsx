import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTransfer } from '../hooks/use-transfer';
import { useTransferPermissions } from '../hooks/use-transfer-permissions';
import { TransferStatusLabel } from '../components/transfer-status-label';
import { TransferLocationsSection } from '../components/transfer-locations-section';
import { TransferDetailsSection } from '../components/transfer-details-section';
import { TransferItemsSection } from '../components/transfer-items-section';
import { TransferTimeline } from '../components/transfer-timeline';
import { TransferActionFooter } from '../components/transfer-action-footer';

export function TransferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: transfer, isLoading, isError } = useTransfer(id!);
  const permissions = useTransferPermissions(transfer);

  if (isLoading) {
    return (
      <div className="px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 bg-ink-200 dark:bg-ink-700" />
          <div className="h-10 w-64 bg-ink-200 dark:bg-ink-700" />
        </div>
      </div>
    );
  }

  if (isError || !transfer) {
    return (
      <div className="px-8 py-8">
        <p className="text-sm font-sans text-ink-500 dark:text-ink-400">
          Transfer not found.
        </p>
      </div>
    );
  }

  const title = transfer.referenceNumber
    ? `#${transfer.referenceNumber}`
    : `${transfer.fromLocation.name} → ${transfer.toLocation.name}`;

  return (
    <div>
      <div className="px-8 pt-8 pb-6 border-b border-ink-900/10 dark:border-ink-50/10">
        <button
          type="button"
          onClick={() => navigate('/transfers')}
          className="flex items-center gap-2 text-xs font-sans text-ink-400 dark:text-ink-500 hover:text-ink-900 dark:hover:text-ink-50 transition-colors mb-4"
        >
          <ArrowLeft size={12} strokeWidth={1.5} />
          Transfers
        </button>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-serif text-4xl font-medium text-ink-900 dark:text-ink-50 leading-tight">
            {title}
          </h1>
          <div className="pt-2">
            <TransferStatusLabel status={transfer.status} />
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-2xl">
        <TransferLocationsSection transfer={transfer} />
        <TransferDetailsSection transfer={transfer} canEdit={permissions.canEdit} />
        <TransferItemsSection transfer={transfer} canEdit={permissions.canEdit} />

        <section className="mb-10">
          <p className="eyebrow text-ink-900 dark:text-ink-50 mb-5">
            <span className="opacity-40">04</span> HISTORY
          </p>
          <TransferTimeline transfer={transfer} />
        </section>
      </div>

      <TransferActionFooter transfer={transfer} permissions={permissions} />
    </div>
  );
}
