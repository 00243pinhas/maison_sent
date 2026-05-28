import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Product, PaginatedResponse, Category, Supplier } from '@/types/api';
import { Field, INPUT_BASE } from '@/components/ui/field';
import { EditorialSelect } from '@/components/ui/editorial-select';
import { productSchema, type ProductFormValues } from '../schema';
import { useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/use-product-mutations';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { useState } from 'react';

interface ProductFormProps {
  initialData?: Product;
  onClose: () => void;
  disabled?: boolean;
}

function useCategoryOptions() {
  return useQuery({
    queryKey: ['categories', 'options'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Category>>('/categories', {
        params: { limit: 100 },
      });
      return data.data;
    },
    staleTime: Infinity,
  });
}

function useSupplierOptions() {
  return useQuery({
    queryKey: ['suppliers', 'options'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Supplier>>('/suppliers', {
        params: { limit: 100 },
      });
      return data.data;
    },
    staleTime: Infinity,
  });
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'DISCONTINUED', label: 'Discontinued' },
];

export function ProductForm({ initialData, onClose, disabled = false }: ProductFormProps) {
  const isEdit = !!initialData;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: categories = [] } = useCategoryOptions();
  const { data: suppliers = [] } = useSupplierOptions();

  const createMutation = useCreateProduct(onClose);
  const updateMutation = useUpdateProduct(initialData?.id ?? '', onClose);
  const deleteMutation = useDeleteProduct(() => { setConfirmOpen(false); onClose(); });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      brand: '',
      sku: '',
      barcode: '',
      categoryId: '',
      supplierId: '',
      costPrice: 0,
      sellingPrice: 0,
      sizeMl: 100,
      status: 'ACTIVE',
      lowStockThreshold: null,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        brand: initialData.brand,
        sku: initialData.sku,
        barcode: initialData.barcode ?? '',
        categoryId: initialData.categoryId,
        supplierId: initialData.supplierId,
        costPrice: initialData.costPrice,
        sellingPrice: initialData.sellingPrice,
        sizeMl: initialData.sizeMl,
        status: initialData.status,
        lowStockThreshold: initialData.lowStockThreshold ?? null,
      });
    }
  }, [initialData, reset]);

  function onSubmit(values: ProductFormValues) {
    if (isEdit) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  const pending = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <form id="product-form" onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* 01 IDENTITY */}
        <p className="eyebrow text-ink-900 dark:text-ink-50 mb-5">
          <span className="opacity-40">01</span> IDENTITY
        </p>
        <div className="space-y-6 mb-10">
          <Field label="Name" error={errors.name?.message}>
            <input {...register('name')} disabled={disabled} className={INPUT_BASE} placeholder="e.g. Oud Intense" />
          </Field>
          <Field label="Brand" error={errors.brand?.message}>
            <input {...register('brand')} disabled={disabled} className={INPUT_BASE} placeholder="e.g. Maison Sent" />
          </Field>
          <Field label="SKU" hint="Alphanumeric, dashes and underscores" error={errors.sku?.message}>
            <input {...register('sku')} disabled={disabled} className={INPUT_BASE} placeholder="e.g. OUD-100-INT" />
          </Field>
          <Field label="Barcode (optional)" error={errors.barcode?.message}>
            <input {...register('barcode')} disabled={disabled} className={INPUT_BASE} placeholder="e.g. 6291108765432" />
          </Field>
        </div>

        {/* 02 CLASSIFICATION */}
        <p className="eyebrow text-ink-900 dark:text-ink-50 mb-5">
          <span className="opacity-40">02</span> CLASSIFICATION
        </p>
        <div className="space-y-6 mb-10">
          <Field label="Category" error={errors.categoryId?.message}>
            <EditorialSelect
              {...register('categoryId')}
              disabled={disabled}
              placeholder="Select a category"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              className="w-full"
            />
          </Field>
          <Field label="Supplier" error={errors.supplierId?.message}>
            <EditorialSelect
              {...register('supplierId')}
              disabled={disabled}
              placeholder="Select a supplier"
              options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
              className="w-full"
            />
          </Field>
        </div>

        {/* 03 PRICING */}
        <p className="eyebrow text-ink-900 dark:text-ink-50 mb-5">
          <span className="opacity-40">03</span> PRICING
        </p>
        <div className="grid grid-cols-2 gap-6 mb-10">
          <Field label="Cost price" error={errors.costPrice?.message}>
            <input
              {...register('costPrice')}
              type="number"
              step="0.01"
              min="0"
              disabled={disabled}
              className={INPUT_BASE}
              placeholder="0.00"
            />
          </Field>
          <Field label="Selling price" error={errors.sellingPrice?.message}>
            <input
              {...register('sellingPrice')}
              type="number"
              step="0.01"
              min="0"
              disabled={disabled}
              className={INPUT_BASE}
              placeholder="0.00"
            />
          </Field>
        </div>

        {/* 04 SPECIFICATIONS */}
        <p className="eyebrow text-ink-900 dark:text-ink-50 mb-5">
          <span className="opacity-40">04</span> SPECIFICATIONS
        </p>
        <div className="grid grid-cols-2 gap-6 mb-10">
          <Field label="Size (ml)" error={errors.sizeMl?.message}>
            <input
              {...register('sizeMl')}
              type="number"
              min="1"
              disabled={disabled}
              className={INPUT_BASE}
              placeholder="100"
            />
          </Field>
          <Field label="Status" error={errors.status?.message}>
            <EditorialSelect
              {...register('status')}
              disabled={disabled}
              options={STATUS_OPTIONS}
              className="w-full"
            />
          </Field>
        </div>

        {/* 05 INVENTORY */}
        <p className="eyebrow text-ink-900 dark:text-ink-50 mb-5">
          <span className="opacity-40">05</span> INVENTORY
        </p>
        <div className="space-y-6 mb-10">
          <Field
            label="Low stock threshold (optional)"
            hint="Leave empty to disable low-stock alerts for this product"
            error={errors.lowStockThreshold?.message}
          >
            <input
              {...register('lowStockThreshold')}
              type="number"
              min="1"
              disabled={disabled}
              className={INPUT_BASE}
              placeholder="e.g. 10"
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-ink-900/10 dark:border-ink-50/10">
          <div>
            {isEdit && !disabled && (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="text-sm font-sans text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors"
              >
                Delete this product
              </button>
            )}
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-sans text-ink-400 dark:text-ink-500 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
            >
              Cancel
            </button>
            {!disabled && (
              <button
                type="submit"
                disabled={pending}
                className="h-10 px-6 bg-ink-900 dark:bg-ink-50 text-white dark:text-ink-900 font-sans font-medium text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {pending ? 'Saving…' : 'Save'}
              </button>
            )}
          </div>
        </div>
      </form>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate(initialData!.id)}
        loading={deleteMutation.isPending}
        title="Delete product?"
        description={`${initialData?.name ?? 'This product'} will be removed from your catalog. This action can be reversed by an administrator.`}
      />
    </>
  );
}
