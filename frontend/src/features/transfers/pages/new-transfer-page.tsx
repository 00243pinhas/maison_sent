import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import type { PaginatedResponse, Location } from '@/types/api';
import { Field, INPUT_BASE, TEXTAREA_BASE } from '@/components/ui/field';
import { EditorialSelect } from '@/components/ui/editorial-select';
import { parseApiError } from '@/lib/parse-error';
import { useCreateTransfer } from '../hooks/use-create-transfer';
import { newTransferSchema, type NewTransferValues } from '../schemas';
import { useState } from 'react';

function useLocationOptions() {
  return useQuery({
    queryKey: ['locations', 'options'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Location>>('/locations', {
        params: { limit: 100 },
      });
      return data.data;
    },
    staleTime: Infinity,
  });
}

export function NewTransferPage() {
  const navigate = useNavigate();
  const { data: locations = [] } = useLocationOptions();
  const [serverError, setServerError] = useState<string | null>(null);

  const createMutation = useCreateTransfer((transfer) => {
    navigate(`/transfers/${transfer.id}`, { replace: true });
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewTransferValues>({
    resolver: zodResolver(newTransferSchema),
    defaultValues: {
      fromLocationId: '',
      toLocationId: '',
      referenceNumber: undefined,
      notes: undefined,
    },
  });

  const locationOptions = locations.map((l) => ({ value: l.id, label: l.name }));

  function onSubmit(values: NewTransferValues) {
    setServerError(null);
    createMutation.mutate(values, {
      onError: (err) => setServerError(parseApiError(err)),
    });
  }

  const pending = isSubmitting || createMutation.isPending;

  return (
    <div className="max-w-xl">
      <div className="px-8 pt-8 pb-6 border-b border-ink-900/10 dark:border-ink-50/10">
        <button
          type="button"
          onClick={() => navigate('/transfers')}
          className="flex items-center gap-2 text-xs font-sans text-ink-400 dark:text-ink-500 hover:text-ink-900 dark:hover:text-ink-50 transition-colors mb-4"
        >
          <ArrowLeft size={12} strokeWidth={1.5} />
          Transfers
        </button>
        <h1 className="font-serif text-4xl font-medium text-ink-900 dark:text-ink-50 leading-tight">
          New Transfer
        </h1>
      </div>

      <div className="px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <p className="eyebrow text-ink-900 dark:text-ink-50 mb-5">
            <span className="opacity-40">01</span> LOCATIONS
          </p>
          <div className="grid grid-cols-2 gap-6 mb-10">
            <Field label="From location" error={errors.fromLocationId?.message}>
              <EditorialSelect
                {...register('fromLocationId')}
                placeholder="Select location"
                options={locationOptions}
                className="w-full"
              />
            </Field>
            <Field label="To location" error={errors.toLocationId?.message}>
              <EditorialSelect
                {...register('toLocationId')}
                placeholder="Select location"
                options={locationOptions}
                className="w-full"
              />
            </Field>
          </div>

          <p className="eyebrow text-ink-900 dark:text-ink-50 mb-5">
            <span className="opacity-40">02</span> DETAILS
          </p>
          <div className="space-y-6 mb-10">
            <Field label="Reference number (optional)" error={errors.referenceNumber?.message}>
              <input
                {...register('referenceNumber')}
                className={INPUT_BASE}
                placeholder="e.g. PO-2026-001"
              />
            </Field>
            <Field label="Notes (optional)" error={errors.notes?.message}>
              <textarea
                {...register('notes')}
                rows={3}
                className={TEXTAREA_BASE}
                placeholder="Additional notes…"
              />
            </Field>
          </div>

          {serverError && (
            <p className="text-sm font-sans text-ink-700 dark:text-ink-300 border border-ink-900/15 dark:border-ink-50/15 px-4 py-3 mb-6">
              {serverError}
            </p>
          )}

          <div className="flex items-center justify-end gap-5">
            <button
              type="button"
              onClick={() => navigate('/transfers')}
              className="text-sm font-sans text-ink-400 dark:text-ink-500 hover:text-ink-900 dark:hover:text-ink-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="h-10 px-6 bg-ink-900 dark:bg-ink-50 text-white dark:text-ink-900 font-sans font-medium text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {pending ? 'Creating…' : 'Create draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
