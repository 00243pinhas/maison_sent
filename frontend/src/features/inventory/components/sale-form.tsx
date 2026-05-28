import { zodResolver } from '@hookform/resolvers/zod';
import { OperationForm, type OperationFormConfig } from './operation-form';
import { saleSchema } from '../schemas';

const config: OperationFormConfig = {
  title: 'Record sale',
  resolver: zodResolver(saleSchema),
  defaultValues: {
    productId: '',
    fromLocationId: '',
    quantity: '',
    referenceNumber: '',
    notes: '',
  },
  locationKind: 'from',
  showBalanceIndicator: true,
  endpoint: '/inventory/sales',
  getSuccessToast: ({ quantity, productName, locationName }) =>
    `Sold ${quantity} units of ${productName} from ${locationName}`,
};

interface SaleFormProps {
  open: boolean;
  onClose: () => void;
}

export function SaleForm({ open, onClose }: SaleFormProps) {
  return <OperationForm open={open} onClose={onClose} config={config} />;
}
