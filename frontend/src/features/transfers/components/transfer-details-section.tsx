import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Field, INPUT_BASE, TEXTAREA_BASE } from '@/components/ui/field';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { useUpdateTransfer } from '../hooks/use-update-transfer';
import type { Transfer } from '@/types/api';

interface TransferDetailsSectionProps {
  transfer: Transfer;
  canEdit: boolean;
}

interface FormValues {
  referenceNumber: string;
  notes: string;
}

export function TransferDetailsSection({ transfer, canEdit }: TransferDetailsSectionProps) {
  const updateMutation = useUpdateTransfer(transfer.id);
  const [savedVisible, setSavedVisible] = useState(false);
  const isInitialMount = useRef(true);

  const { register, watch, reset } = useForm<FormValues>({
    defaultValues: {
      referenceNumber: transfer.referenceNumber ?? '',
      notes: transfer.notes ?? '',
    },
  });

  useEffect(() => {
    reset({
      referenceNumber: transfer.referenceNumber ?? '',
      notes: transfer.notes ?? '',
    });
    isInitialMount.current = true;
  }, [transfer.id, reset]);

  const refNum = watch('referenceNumber');
  const notes = watch('notes');
  const debouncedRef = useDebouncedValue(refNum, 800);
  const debouncedNotes = useDebouncedValue(notes, 800);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!canEdit) return;
    updateMutation.mutate({
      referenceNumber: debouncedRef || null,
      notes: debouncedNotes || null,
    });
  }, [debouncedRef, debouncedNotes]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (updateMutation.isSuccess) {
      setSavedVisible(true);
      const t = setTimeout(() => setSavedVisible(false), 2000);
      return () => clearTimeout(t);
    }
  }, [updateMutation.isSuccess]);

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <p className="eyebrow text-ink-900 dark:text-ink-50">
          <span className="opacity-40">02</span> DETAILS
        </p>
        {savedVisible && (
          <span className="eyebrow text-ink-400 dark:text-ink-500">Saved</span>
        )}
      </div>
      <div className="space-y-6">
        <Field label="Reference number (optional)">
          <input
            {...register('referenceNumber')}
            disabled={!canEdit}
            className={INPUT_BASE}
            placeholder="e.g. PO-2026-001"
          />
        </Field>
        <Field label="Notes (optional)">
          <textarea
            {...register('notes')}
            disabled={!canEdit}
            rows={3}
            className={TEXTAREA_BASE}
            placeholder="Additional notes…"
          />
        </Field>
      </div>
    </section>
  );
}
