import { useAuthStore } from '@/stores/auth.store';
import type { Transfer } from '@/types/api';

export interface TransferPermissions {
  canEdit: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canCancel: boolean;
  canComplete: boolean;
}

const NONE: TransferPermissions = {
  canEdit: false,
  canSubmit: false,
  canApprove: false,
  canReject: false,
  canCancel: false,
  canComplete: false,
};

export function useTransferPermissions(transfer: Transfer | undefined): TransferPermissions {
  const user = useAuthStore((s) => s.user);
  if (!transfer || !user) return NONE;

  const role = user.role;
  const isCreator = transfer.createdBy === user.id;
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const isDraft = transfer.status === 'DRAFT';
  const isPending = transfer.status === 'PENDING_APPROVAL';
  const isApproved = transfer.status === 'APPROVED';

  return {
    canEdit: isDraft && (isCreator || isAdmin),
    canSubmit: isDraft && (isCreator || isAdmin),
    canApprove: isPending && isAdmin,
    canReject: isPending && isAdmin,
    canCancel: (isDraft || isPending) && (isCreator || isAdmin),
    canComplete: isApproved && (isAdmin || role === 'WAREHOUSE_MANAGER'),
  };
}
