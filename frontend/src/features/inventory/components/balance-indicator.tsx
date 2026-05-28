import { useBalance } from '../hooks/use-balance';

interface BalanceIndicatorProps {
  productId?: string;
  locationId?: string;
  enteredQuantity?: number;
}

export function BalanceIndicator({ productId, locationId, enteredQuantity }: BalanceIndicatorProps) {
  const { data: balance, isLoading } = useBalance(productId, locationId);

  if (!productId || !locationId) return null;
  if (isLoading) return null;

  const available = balance?.quantity ?? 0;
  const locationName = balance?.location?.name ?? '';
  const exceeds =
    enteredQuantity !== undefined && enteredQuantity > 0 && enteredQuantity > available;

  if (exceeds) {
    return (
      <p className="eyebrow text-ink-500 dark:text-ink-400 mt-1.5">
        Available: {available.toLocaleString()} units{locationName ? ` at ${locationName}` : ''} — entered quantity exceeds available stock
      </p>
    );
  }

  return (
    <p className="eyebrow text-ink-400 dark:text-ink-500 mt-1.5">
      Available: {available.toLocaleString()} units{locationName ? ` at ${locationName}` : ''}
    </p>
  );
}
