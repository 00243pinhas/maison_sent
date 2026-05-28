import { useRemoveItem } from '../hooks/use-remove-item';
import { TransferItemForm } from './transfer-item-form';
import type { Transfer } from '@/types/api';

interface TransferItemsSectionProps {
  transfer: Transfer;
  canEdit: boolean;
}

export function TransferItemsSection({ transfer, canEdit }: TransferItemsSectionProps) {
  const items = transfer.items ?? [];
  const removeItem = useRemoveItem(transfer.id);

  return (
    <section className="mb-10">
      <p className="eyebrow text-ink-900 dark:text-ink-50 mb-5">
        <span className="opacity-40">03</span> ITEMS
      </p>

      {items.length === 0 ? (
        <p className="text-sm font-sans text-ink-400 dark:text-ink-500 mb-4">
          No items added yet.
        </p>
      ) : (
        <table className="w-full mb-2">
          <thead>
            <tr>
              <th className="eyebrow text-ink-400 dark:text-ink-500 pb-3 pr-6 text-left border-b border-ink-900/15 dark:border-ink-50/15">
                Product
              </th>
              <th className="eyebrow text-ink-400 dark:text-ink-500 pb-3 pr-6 text-left border-b border-ink-900/15 dark:border-ink-50/15">
                SKU
              </th>
              <th className="eyebrow text-ink-400 dark:text-ink-500 pb-3 pr-6 text-right border-b border-ink-900/15 dark:border-ink-50/15 w-20">
                Qty
              </th>
              {canEdit && (
                <th className="border-b border-ink-900/15 dark:border-ink-50/15 w-10" />
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="group">
                <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans text-ink-900 dark:text-ink-100">
                  {item.product.name}
                  <span className="text-ink-400 dark:text-ink-500 ml-1.5 text-xs">
                    {item.product.brand}
                  </span>
                </td>
                <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10">
                  <span className="font-mono text-xs text-ink-400 dark:text-ink-500">
                    {item.product.sku}
                  </span>
                </td>
                <td className="py-3.5 pr-6 border-b border-ink-900/10 dark:border-ink-50/10 text-sm font-sans text-ink-900 dark:text-ink-100 text-right tabular-nums">
                  {item.quantity.toLocaleString()}
                </td>
                {canEdit && (
                  <td className="py-3.5 border-b border-ink-900/10 dark:border-ink-50/10 text-right">
                    <button
                      type="button"
                      onClick={() => removeItem.mutate(item.id)}
                      disabled={removeItem.isPending}
                      className="text-xs font-sans text-ink-300 dark:text-ink-600 hover:text-ink-700 dark:hover:text-ink-300 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {canEdit && <TransferItemForm transferId={transfer.id} />}
    </section>
  );
}
