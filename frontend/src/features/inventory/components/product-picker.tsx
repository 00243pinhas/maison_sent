import { useCallback } from 'react';
import { ResourcePicker } from '@/components/ui/resource-picker';
import { getProducts } from '@/features/products/api/products.api';
import type { Product } from '@/types/api';

interface ProductPickerProps {
  label?: string;
  value: string | null;
  onChange: (product: Product) => void;
  error?: string;
}

export function ProductPicker({ label = 'Product', value, onChange, error }: ProductPickerProps) {
  const fetchOptions = useCallback(async (search: string) => {
    const result = await getProducts({ search, limit: 20 });
    return result.data;
  }, []);

  return (
    <ResourcePicker<Product>
      label={label}
      value={value}
      onChange={onChange}
      placeholder="Select a product"
      searchPlaceholder="Search products by name, SKU, or brand"
      fetchOptions={fetchOptions}
      renderOption={(product) => (
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-sans text-ink-900 dark:text-ink-50 truncate">{product.name}</p>
            <p className="text-xs font-sans text-ink-400 dark:text-ink-500 truncate">
              {product.brand} · {product.sku}
            </p>
          </div>
          <span className="eyebrow text-ink-400 dark:text-ink-500 shrink-0">
            {product.sizeMl}ml
          </span>
        </div>
      )}
      getDisplayValue={(product) => `${product.name} · ${product.sku}`}
      error={error}
    />
  );
}
