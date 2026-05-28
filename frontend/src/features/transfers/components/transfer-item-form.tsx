import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, INPUT_BASE } from '@/components/ui/field';
import { ProductPicker } from '@/features/inventory/components/product-picker';
import { useAddItem } from '../hooks/use-add-item';
import { transferItemSchema, type TransferItemValues } from '../schemas';
import type { Product } from '@/types/api';

interface TransferItemFormProps {
  transferId: string;
}

export function TransferItemForm({ transferId }: TransferItemFormProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const addItem = useAddItem(transferId);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransferItemValues>({
    resolver: zodResolver(transferItemSchema),
    defaultValues: { productId: '', quantity: 1 },
  });

  function onSubmit(values: TransferItemValues) {
    addItem.mutate(values, {
      onSuccess: () => {
        reset({ productId: '', quantity: 1 });
        setSelectedProduct(null);
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="pt-4 border-t border-ink-900/10 dark:border-ink-50/10">
      <p className="eyebrow text-ink-400 dark:text-ink-500 mb-4">Add item</p>
      <div className="grid grid-cols-[1fr_120px_auto] gap-4 items-end">
        <ProductPicker
          label="Product"
          value={selectedProduct?.id ?? null}
          onChange={(product) => {
            setSelectedProduct(product);
            setValue('productId', product.id, { shouldValidate: true });
          }}
          error={errors.productId?.message}
        />
        <Field label="Qty" error={errors.quantity?.message}>
          <input
            {...register('quantity')}
            type="number"
            min="1"
            className={INPUT_BASE}
            placeholder="1"
          />
        </Field>
        <button
          type="submit"
          disabled={addItem.isPending}
          className="h-10 px-5 bg-ink-900 dark:bg-ink-50 text-white dark:text-ink-900 font-sans font-medium text-sm disabled:opacity-50 hover:opacity-90 transition-opacity shrink-0"
        >
          {addItem.isPending ? '…' : 'Add'}
        </button>
      </div>
    </form>
  );
}
