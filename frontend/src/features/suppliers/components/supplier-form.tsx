import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Supplier } from '@/types/api';
import { Field, INPUT_BASE } from '@/components/ui/field';
import { supplierSchema, type SupplierFormValues } from '../schema';
import { useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '../hooks/use-supplier-mutations';
import { ConfirmModal } from '@/components/ui/confirm-modal';

interface SupplierFormProps {
  initialData?: Supplier;
  onClose: () => void;
  disabled?: boolean;
}

export function SupplierForm({ initialData, onClose, disabled = false }: SupplierFormProps) {
  const isEdit = !!initialData;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const createMutation = useCreateSupplier(onClose);
  const updateMutation = useUpdateSupplier(initialData?.id ?? '', onClose);
  const deleteMutation = useDeleteSupplier(() => { setConfirmOpen(false); onClose(); });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { name: '', phone: '', email: '', country: '' },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        phone: initialData.phone ?? '',
        email: initialData.email ?? '',
        country: initialData.country ?? '',
      });
    }
  }, [initialData, reset]);

  function onSubmit(values: SupplierFormValues) {
    if (isEdit) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  const pending = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <form id="supplier-form" onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* 01 IDENTITY */}
        <p className="eyebrow text-ink-900 dark:text-ink-50 mb-5">
          <span className="opacity-40">01</span> IDENTITY
        </p>
        <div className="space-y-6 mb-10">
          <Field label="Name" error={errors.name?.message}>
            <input
              {...register('name')}
              disabled={disabled}
              className={INPUT_BASE}
              placeholder="e.g. Gulf Fragrance Co."
            />
          </Field>
          <Field label="Country (optional)" error={errors.country?.message}>
            <input
              {...register('country')}
              disabled={disabled}
              className={INPUT_BASE}
              placeholder="e.g. United Arab Emirates"
            />
          </Field>
        </div>

        {/* 02 CONTACT */}
        <p className="eyebrow text-ink-900 dark:text-ink-50 mb-5">
          <span className="opacity-40">02</span> CONTACT
        </p>
        <div className="space-y-6 mb-10">
          <Field label="Phone (optional)" error={errors.phone?.message}>
            <input
              {...register('phone')}
              type="tel"
              disabled={disabled}
              className={INPUT_BASE}
              placeholder="e.g. +971 50 123 4567"
            />
          </Field>
          <Field label="Email (optional)" error={errors.email?.message}>
            <input
              {...register('email')}
              type="email"
              disabled={disabled}
              className={INPUT_BASE}
              placeholder="e.g. orders@supplier.com"
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
                Delete this supplier
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
        title="Delete supplier?"
        description={`"${initialData?.name ?? 'This supplier'}" will be removed. Products linked to it may be affected.`}
      />
    </>
  );
}
