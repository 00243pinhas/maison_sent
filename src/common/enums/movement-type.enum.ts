export enum MovementType {
  RECEIVED = 'RECEIVED',
  SALE = 'SALE',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
  ADJUSTMENT_IN = 'ADJUSTMENT_IN',
  ADJUSTMENT_OUT = 'ADJUSTMENT_OUT',
  TRANSFER = 'TRANSFER',
}

export const MOVEMENT_DIRECTION: Record<
  MovementType,
  { requiresFrom: boolean; requiresTo: boolean }
> = {
  [MovementType.RECEIVED]: { requiresFrom: false, requiresTo: true },
  [MovementType.SALE]: { requiresFrom: true, requiresTo: false },
  [MovementType.RETURN]: { requiresFrom: false, requiresTo: true },
  [MovementType.DAMAGE]: { requiresFrom: true, requiresTo: false },
  [MovementType.ADJUSTMENT_IN]: { requiresFrom: false, requiresTo: true },
  [MovementType.ADJUSTMENT_OUT]: { requiresFrom: true, requiresTo: false },
  [MovementType.TRANSFER]: { requiresFrom: true, requiresTo: true },
};
