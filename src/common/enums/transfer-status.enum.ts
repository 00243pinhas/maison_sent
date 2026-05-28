export enum TransferStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export const TRANSFER_TRANSITIONS: Record<TransferStatus, TransferStatus[]> = {
  [TransferStatus.DRAFT]: [
    TransferStatus.PENDING_APPROVAL,
    TransferStatus.CANCELLED,
  ],
  [TransferStatus.PENDING_APPROVAL]: [
    TransferStatus.APPROVED,
    TransferStatus.REJECTED,
    TransferStatus.CANCELLED,
  ],
  [TransferStatus.APPROVED]: [TransferStatus.COMPLETED],
  [TransferStatus.COMPLETED]: [],
  [TransferStatus.REJECTED]: [],
  [TransferStatus.CANCELLED]: [],
};
