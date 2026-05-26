import { MovementType } from '../../../common/enums/movement-type.enum';

export const TRANSFER_SUBMITTED = 'transfer.submitted';
export const TRANSFER_APPROVED = 'transfer.approved';
export const TRANSFER_REJECTED = 'transfer.rejected';
export const TRANSFER_COMPLETED = 'transfer.completed';
export const INVENTORY_OUTBOUND = 'inventory.outbound';

export interface TransferSubmittedPayload {
  transferId: string;
  creatorId: string;
  fromLocationId: string;
  toLocationId: string;
  referenceNumber: string | null;
}

export interface TransferApprovedPayload {
  transferId: string;
  creatorId: string;
  approverId: string;
}

export interface TransferRejectedPayload {
  transferId: string;
  creatorId: string;
  approverId: string;
  reason: string;
}

export interface TransferCompletedPayload {
  transferId: string;
  creatorId: string;
  completerId: string;
  fromLocationId: string;
  toLocationId: string;
}

export interface InventoryOutboundPayload {
  productId: string;
  locationId: string;
  newBalance: number;
  movementType: MovementType;
  performedById: string;
}
