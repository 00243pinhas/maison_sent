import type { MovementType } from '@/types/api';

const INBOUND_TYPES: MovementType[] = ['RECEIVED', 'RETURN', 'ADJUSTMENT_IN'];

export function getMovementMarker(type: MovementType): '●' | '○' | '◐' {
  if (type === 'TRANSFER') return '◐';
  if (INBOUND_TYPES.includes(type)) return '●';
  return '○';
}

export function getMovementLabel(type: MovementType): string {
  switch (type) {
    case 'RECEIVED': return 'Received';
    case 'SALE': return 'Sale';
    case 'RETURN': return 'Return';
    case 'DAMAGE': return 'Damage';
    case 'ADJUSTMENT_IN': return 'Adjusted';
    case 'ADJUSTMENT_OUT': return 'Adjusted';
    case 'TRANSFER': return 'Transfer';
  }
}

export function getMovementSignedQuantity(quantity: number, type: MovementType): string {
  const isInbound = INBOUND_TYPES.includes(type);
  return `${isInbound ? '+' : '−'}${quantity.toLocaleString()}`;
}

export function getMovementCounterparty(
  movement: {
    movementType: MovementType;
    fromLocation: { name: string } | null;
    toLocation: { name: string } | null;
  },
  side: 'from' | 'to',
): string {
  if (side === 'from') {
    if (movement.fromLocation) return movement.fromLocation.name;
    if (movement.movementType === 'RECEIVED') return 'Supplier';
    return '—';
  } else {
    if (movement.toLocation) return movement.toLocation.name;
    if (movement.movementType === 'SALE') return 'Customer';
    return '—';
  }
}
