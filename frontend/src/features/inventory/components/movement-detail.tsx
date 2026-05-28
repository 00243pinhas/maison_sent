import { ReadOnlySheet } from '@/components/ui/read-only-sheet';
import { fmtDateTime, fmtCurrency } from '@/lib/format';
import { getMovementLabel, getMovementMarker } from '@/lib/utils/movement-display';
import { useMovement } from '../hooks/use-movement';

interface MovementDetailProps {
  movementId: string | null;
  onClose: () => void;
}

function formatPerformer(user: { fullName: string } | null | undefined): string {
  if (!user?.fullName) return '—';
  const parts = user.fullName.trim().split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export function MovementDetail({ movementId, onClose }: MovementDetailProps) {
  const { data: movement, isLoading } = useMovement(movementId);

  const fields = movement
    ? [
        {
          label: 'Type',
          value: (
            <span>
              {getMovementMarker(movement.movementType)}{' '}
              {getMovementLabel(movement.movementType)}
            </span>
          ),
        },
        { label: 'Time', value: fmtDateTime(movement.createdAt) },
        { label: 'Product', value: `${movement.product.name} · ${movement.product.sku}` },
        { label: 'Brand', value: movement.product.brand },
        { label: 'Size', value: `${movement.product.sizeMl} ml` },
        {
          label: 'Quantity',
          value: movement.quantity.toLocaleString(),
        },
        {
          label: 'From location',
          value: movement.fromLocation?.name ?? (movement.movementType === 'RECEIVED' ? 'Supplier' : '—'),
        },
        {
          label: 'To location',
          value: movement.toLocation?.name ?? (movement.movementType === 'SALE' ? 'Customer' : '—'),
        },
        {
          label: 'Unit cost price',
          value: movement.unitCostPrice ? fmtCurrency(movement.unitCostPrice) : '—',
        },
        {
          label: 'Unit selling price',
          value: movement.unitSellingPrice ? fmtCurrency(movement.unitSellingPrice) : '—',
        },
        { label: 'Reference', value: movement.referenceNumber ?? '—' },
        { label: 'Notes', value: movement.notes ?? '—' },
        { label: 'Performed by', value: formatPerformer(movement.performedBy) },
      ]
    : [];

  return (
    <ReadOnlySheet
      open={!!movementId}
      onClose={onClose}
      title={isLoading ? 'Loading…' : movement ? `Movement · ${getMovementLabel(movement.movementType)}` : 'Movement'}
      fields={fields}
    />
  );
}
