import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAwaitingApproval } from '@/hooks/useAwaitingApproval';
import { useLowestStock } from '@/hooks/useLowestStock';
import { SkeletonLine } from '@/components/ui/Skeleton';
import { InlineActionRow } from '@/components/ui/inline-action-row';
import { RejectTransferModal } from '@/features/transfers/components/reject-transfer-modal';
import { useApproveTransfer } from '@/features/transfers/hooks/use-approve-transfer';
import { useRejectTransfer } from '@/features/transfers/hooks/use-reject-transfer';
import { useAuthStore } from '@/stores/auth.store';
import { parseApiError } from '@/lib/parse-error';
import { formatDistanceToNow } from 'date-fns';
import type { Transfer } from '@/types/api';

function PendingTransferRow({ transfer }: { transfer: Transfer }) {
  const navigate = useNavigate();
  const [rejectOpen, setRejectOpen] = useState(false);
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';

  const approveMutation = useApproveTransfer(transfer.id);
  const rejectMutation = useRejectTransfer(transfer.id);

  return (
    <>
      <div className="py-3 border-b border-ink-900/10 dark:border-ink-50/10 last:border-0">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => navigate(`/transfers/${transfer.id}`)}
            className="text-sm font-sans font-medium text-ink-900 dark:text-ink-100 truncate hover:underline text-left"
          >
            {transfer.fromLocation.name} → {transfer.toLocation.name}
          </button>
          {transfer.referenceNumber && (
            <span className="text-xs font-mono text-ink-400 shrink-0">
              #{transfer.referenceNumber}
            </span>
          )}
        </div>
        <p className="text-xs text-ink-400 dark:text-ink-500 font-sans mt-0.5">
          {transfer.items?.length != null
            ? `${transfer.items.length} item${transfer.items.length !== 1 ? 's' : ''} · `
            : ''}
          {formatDistanceToNow(new Date(transfer.createdAt), { addSuffix: true })}
        </p>
        {isAdmin && (
          <InlineActionRow
            className="mt-2"
            actions={[
              {
                label: 'Approve',
                loading: approveMutation.isPending,
                onClick: () => {
                  approveMutation.mutate(undefined, {
                    onSuccess: () => toast.success('Transfer approved.'),
                    onError: (err) => toast.error(parseApiError(err)),
                  });
                },
              },
              {
                label: 'Reject',
                variant: 'danger',
                loading: rejectMutation.isPending,
                onClick: () => setRejectOpen(true),
              },
            ]}
          />
        )}
      </div>

      <RejectTransferModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={(reason) => {
          rejectMutation.mutate(reason, {
            onSuccess: () => {
              setRejectOpen(false);
              toast.success('Transfer rejected.');
            },
          });
        }}
        loading={rejectMutation.isPending}
      />
    </>
  );
}

export function PendingAndLowStockSection() {
  const { data: pending, isLoading: pendLoading, isError: pendError } = useAwaitingApproval();
  const { data: lowStock, isLoading: lowLoading, isError: lowError } = useLowestStock();

  return (
    <div className="flex flex-col gap-0 divide-y divide-ink-900/10 dark:divide-ink-50/10">
      {/* 03 AWAITING APPROVAL */}
      <div className="py-8 px-8">
        <div className="flex items-center gap-2 mb-5">
          <p className="eyebrow text-ink-900 dark:text-ink-50">
            <span className="opacity-40">03</span> AWAITING APPROVAL
          </p>
          {pending && pending.total > 0 && (
            <span className="eyebrow ml-auto text-ink-400 dark:text-ink-500">
              {pending.total} total
            </span>
          )}
        </div>

        {pendError && (
          <p className="text-sm font-sans text-ink-400 dark:text-ink-500 py-2">
            · Could not load pending transfers
          </p>
        )}

        {pendLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="py-3 border-b border-ink-900/10 dark:border-ink-50/10">
              <SkeletonLine className="h-3.5 w-3/4 mb-1.5" />
              <SkeletonLine className="h-3 w-1/2" />
            </div>
          ))}

        {!pendLoading && !pendError &&
          pending?.data.map((t) => <PendingTransferRow key={t.id} transfer={t} />)}

        {!pendLoading && !pendError && pending?.data.length === 0 && (
          <p className="text-sm text-ink-400 font-sans py-2">No transfers awaiting approval.</p>
        )}
      </div>

      {/* 04 LOWEST STOCK */}
      <div className="py-8 px-8">
        <p className="eyebrow text-ink-900 dark:text-ink-50 mb-5">
          <span className="opacity-40">04</span> LOWEST STOCK
        </p>

        {lowError && (
          <p className="text-sm font-sans text-ink-400 dark:text-ink-500 py-2">
            · Could not load stock levels
          </p>
        )}

        {lowLoading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="py-3 border-b border-ink-900/10 dark:border-ink-50/10">
              <SkeletonLine className="h-3.5 w-3/4 mb-1.5" />
              <SkeletonLine className="h-3 w-1/3" />
            </div>
          ))}

        {!lowLoading && !lowError &&
          lowStock?.map((item) => (
            <div
              key={`${item.productId}-${item.locationId}`}
              className="py-3 border-b border-ink-900/10 dark:border-ink-50/10 last:border-0 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-sans font-medium text-ink-900 dark:text-ink-100 truncate">
                  {item.productName}
                </p>
                <p className="text-xs text-ink-400 dark:text-ink-500 font-sans">
                  {item.sku} · {item.locationName}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium font-sans text-ink-900 dark:text-ink-100 tabular-nums">
                  {parseInt(item.quantity).toLocaleString()}
                </p>
                <p className="text-xs text-ink-400 dark:text-ink-500 font-sans">units</p>
              </div>
            </div>
          ))}

        {!lowLoading && !lowError && lowStock?.length === 0 && (
          <p className="text-sm text-ink-400 font-sans py-2">All stock levels healthy.</p>
        )}
      </div>
    </div>
  );
}
