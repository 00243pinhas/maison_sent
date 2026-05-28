export interface MovementsQuery {
  productId?: string;
  locationId?: string;
  movementType?: string;
  performedBy?: string;
  referenceNumber?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface BalancesQuery {
  productId?: string;
  locationId?: string;
  minQuantity?: number;
  maxQuantity?: number;
  search?: string;
  page?: number;
  limit?: number;
}
