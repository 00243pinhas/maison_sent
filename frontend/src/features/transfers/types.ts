import type { TransferStatus } from '@/types/api';

export interface TransfersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: TransferStatus | '';
  fromLocationId?: string;
  toLocationId?: string;
}
