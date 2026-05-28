import { zodResolver } from '@hookform/resolvers/zod';
import { OperationForm, type OperationFormConfig } from './operation-form';
import { adjustSchema } from '../schemas';

const config: OperationFormConfig = {
  title: 'Adjust stock',
  resolver: zodResolver(adjustSchema),
  defaultValues: {
    productId: '',
    locationId: '',
    direction: 'INCREASE',
    quantity: '',
    referenceNumber: '',
    notes: '',
  },
  locationKind: 'single',
  showDirection: true,
  showBalanceIndicator: true,
  referenceRequired: true,
  referenceHint: 'Required for audit trail. e.g. "Cycle count 2026-05-26"',
  endpoint: '/inventory/adjust',
  getSuccessToast: ({ quantity, productName, locationName, direction }) =>
    `Adjusted ${productName} by ${direction === 'INCREASE' ? '+' : '−'}${quantity} units at ${locationName}`,
};

interface AdjustFormProps {
  open: boolean;
  onClose: () => void;
}

export function AdjustForm({ open, onClose }: AdjustFormProps) {
  return <OperationForm open={open} onClose={onClose} config={config} />;
}
