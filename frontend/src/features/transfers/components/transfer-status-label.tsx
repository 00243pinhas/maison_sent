import { StatusLabel } from '@/components/ui/status-label';
import type { TransferStatus } from '@/types/api';
import type { ComponentProps } from 'react';

type Variant = ComponentProps<typeof StatusLabel>['variant'];

const STATUS_MAP: Record<TransferStatus, { label: string; variant: Variant }> = {
  DRAFT: { label: 'Draft', variant: 'muted' },
  PENDING_APPROVAL: { label: 'Pending Approval', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  COMPLETED: { label: 'Completed', variant: 'default' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
  CANCELLED: { label: 'Cancelled', variant: 'muted' },
};

interface TransferStatusLabelProps {
  status: TransferStatus;
  className?: string;
}

export function TransferStatusLabel({ status, className }: TransferStatusLabelProps) {
  const { label, variant } = STATUS_MAP[status];
  return <StatusLabel label={label} variant={variant} className={className} />;
}
