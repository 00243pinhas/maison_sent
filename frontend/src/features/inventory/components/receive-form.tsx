import { zodResolver } from '@hookform/resolvers/zod';
import { OperationForm, type OperationFormConfig } from './operation-form';
import { receiveSchema } from '../schemas';

const config: OperationFormConfig = {
  title: 'Receive stock',
  resolver: zodResolver(receiveSchema),
  defaultValues: {
    productId: '',
    toLocationId: '',
    quantity: '',
    referenceNumber: '',
    notes: '',
  },
  locationKind: 'to',
  endpoint: '/inventory/receive',
  getSuccessToast: ({ quantity, productName, locationName }) =>
    `Received ${quantity} units of ${productName} at ${locationName}`,
};

interface ReceiveFormProps {
  open: boolean;
  onClose: () => void;
}

export function ReceiveForm({ open, onClose }: ReceiveFormProps) {
  return <OperationForm open={open} onClose={onClose} config={config} />;
}
