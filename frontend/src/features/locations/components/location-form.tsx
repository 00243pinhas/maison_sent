import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Location } from '@/types/api';
import { Field, INPUT_BASE, TEXTAREA_BASE } from '@/components/ui/field';
import { EditorialSelect } from '@/components/ui/editorial-select';
import { locationSchema, type LocationFormValues } from '../schema';
import { useCreateLocation, useUpdateLocation, useDeleteLocation } from '../hooks/use-location-mutations';
import { ConfirmModal } from '@/components/ui/confirm-modal';

interface LocationFormProps {
  initialData?: Location;
  onClose: () => void;
  disabled?: boolean;
}

const TYPE_OPTIONS = [
  { value: 'WAREHOUSE', label: 'Warehouse' },
  { value: 'BRANCH', label: 'Branch' },
  { value: 'HEAD_OFFICE', label: 'Head Office' },
];

export function LocationForm({ initialData, onClose, disabled = false }: LocationFormProps) {
  const isEdit = !!initialData;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const createMutation = useCreateLocation(onClose);
  const updateMutation = useUpdateLocation(initialData?.id ?? '', onClose);
  const deleteMutation = useDeleteLocation(() => { setConfirmOpen(false); onClose(); });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: { name: '', type: 'BRANCH', city: '', address: '' },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        type: initialData.type,
        city: initialData.city ?? '',
        address: initialData.address ?? '',
      });
    }
  }, [initialData, reset]);

  function onSubmit(values: LocationFormValues) {
    if (isEdit) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  const pending = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <form id="location-form" onSubmit={handleSubmit(onSubmit)} noValidate>

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
              placeholder="e.g. Riyadh Showroom"
            />
          </Field>
          <Field label="Type" error={errors.type?.message}>
            <EditorialSelect
              {...register('type')}
              disabled={disabled}
              options={TYPE_OPTIONS}
              className="w-full"
            />
          </Field>
        </div>

        {/* 02 ADDRESS */}
        <p className="eyebrow text-ink-900 dark:text-ink-50 mb-5">
          <span className="opacity-40">02</span> ADDRESS
        </p>
        <div className="space-y-6 mb-10">
          <Field label="City (optional)" error={errors.city?.message}>
            <input
              {...register('city')}
              disabled={disabled}
              className={INPUT_BASE}
              placeholder="e.g. Riyadh"
            />
          </Field>
          <Field label="Address (optional)" error={errors.address?.message}>
            <textarea
              {...register('address')}
              disabled={disabled}
              rows={3}
              className={TEXTAREA_BASE}
              placeholder="e.g. Al Olaya District, King Fahd Rd"
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
                Delete this location
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
        title="Delete location?"
        description={`"${initialData?.name ?? 'This location'}" will be removed. Inventory and transfers linked to it may be affected.`}
      />
    </>
  );
}
