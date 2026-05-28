import { zodResolver } from '@hookform/resolvers/zod';
import { OperationForm, type OperationFormConfig } from './operation-form';
import { damageSchema } from '../schemas';

const config: OperationFormConfig = {
  title: 'Record damage',
  resolver: zodResolver(damageSchema),
  defaultValues: {
    productId: '',
    fromLocationId: '',
    quantity: '',
    referenceNumber: '',
    notes: '',
  },
  locationKind: 'from',
  showBalanceIndicator: true,
  notesHint: 'Describe what was damaged and how',
  endpoint: '/inventory/damage',
  getSuccessToast: ({ quantity, productName, locationName }) =>
    `Recorded ${quantity} damaged units of ${productName} at ${locationName}`,
};

interface DamageFormProps {
  open: boolean;
  onClose: () => void;
}

export function DamageForm({ open, onClose }: DamageFormProps) {
  return <OperationForm open={open} onClose={onClose} config={config} />;
}
