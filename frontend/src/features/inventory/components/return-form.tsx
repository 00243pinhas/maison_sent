import { zodResolver } from '@hookform/resolvers/zod';
import { OperationForm, type OperationFormConfig } from './operation-form';
import { returnSchema } from '../schemas';

const config: OperationFormConfig = {
  title: 'Record return',
  resolver: zodResolver(returnSchema),
  defaultValues: {
    productId: '',
    toLocationId: '',
    quantity: '',
    referenceNumber: '',
    notes: '',
  },
  locationKind: 'to',
  notesHint: 'Reason for return',
  endpoint: '/inventory/returns',
  getSuccessToast: ({ quantity, productName, locationName }) =>
    `Returned ${quantity} units of ${productName} to ${locationName}`,
};

interface ReturnFormProps {
  open: boolean;
  onClose: () => void;
}

export function ReturnForm({ open, onClose }: ReturnFormProps) {
  return <OperationForm open={open} onClose={onClose} config={config} />;
}
