import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Category } from '@/types/api';
import { Field, INPUT_BASE } from '@/components/ui/field';
import { categorySchema, type CategoryFormValues } from '../schema';
import { useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/use-category-mutations';
import { ConfirmModal } from '@/components/ui/confirm-modal';

interface CategoryFormProps {
  initialData?: Category;
  onClose: () => void;
  disabled?: boolean;
}

export function CategoryForm({ initialData, onClose, disabled = false }: CategoryFormProps) {
  const isEdit = !!initialData;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const createMutation = useCreateCategory(onClose);
  const updateMutation = useUpdateCategory(initialData?.id ?? '', onClose);
  const deleteMutation = useDeleteCategory(() => { setConfirmOpen(false); onClose(); });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (initialData) reset({ name: initialData.name });
  }, [initialData, reset]);

  function onSubmit(values: CategoryFormValues) {
    if (isEdit) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  const pending = isSubmitting || createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <form id="category-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <p className="eyebrow text-ink-900 dark:text-ink-50 mb-5">
          <span className="opacity-40">01</span> IDENTITY
        </p>
        <div className="space-y-6 mb-10">
          <Field label="Name" error={errors.name?.message}>
            <input
              {...register('name')}
              disabled={disabled}
              className={INPUT_BASE}
              placeholder="e.g. Oriental"
            />
          </Field>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-ink-900/10 dark:border-ink-50/10">
          <div>
            {isEdit && !disabled && (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="text-sm font-sans text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors"
              >
                Delete this category
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
        title="Delete category?"
        description={`"${initialData?.name ?? 'This category'}" will be removed. Products assigned to it may be affected.`}
      />
    </>
  );
}
