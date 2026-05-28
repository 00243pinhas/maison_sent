import { useState, useEffect } from 'react';
import { useForm, type FieldValues, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';
import { SideSheet } from '@/components/ui/side-sheet';
import { Field, INPUT_BASE, TEXTAREA_BASE } from '@/components/ui/field';
import { EditorialSelect } from '@/components/ui/editorial-select';
import { useLocations } from '@/features/locations/hooks/use-locations';
import { parseApiError } from '@/lib/parse-error';
import { ProductPicker } from './product-picker';
import { BalanceIndicator } from './balance-indicator';
import { useCreateMovement } from '../hooks/use-create-movement';
import type { Product } from '@/types/api';
import { cn } from '@/lib/cn';

export interface OperationFormConfig {
  title: string;
  resolver: Resolver<FieldValues>;
  defaultValues: FieldValues;
  locationKind: 'to' | 'from' | 'single';
  showDirection?: boolean;
  referenceRequired?: boolean;
  showBalanceIndicator?: boolean;
  notesHint?: string;
  referenceHint?: string;
  endpoint: string;
  getSuccessToast: (params: {
    quantity: number;
    productName: string;
    locationName: string;
    direction?: string;
  }) => string;
}

interface OperationFormProps {
  open: boolean;
  onClose: () => void;
  config: OperationFormConfig;
}

export function OperationForm({ open, onClose, config }: OperationFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: locationsData } = useLocations({ limit: 100 });
  const locations = locationsData?.data ?? [];
  const locationOptions = locations.map((l) => ({ value: l.id, label: l.name }));

  const locationFieldName =
    config.locationKind === 'to'
      ? 'toLocationId'
      : config.locationKind === 'from'
        ? 'fromLocationId'
        : 'locationId';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    resolver: config.resolver,
    defaultValues: config.defaultValues,
  });

  const productId = watch('productId') as string | undefined;
  const locationId = watch(locationFieldName) as string | undefined;
  const direction = watch('direction') as string | undefined;
  const quantity = watch('quantity') as number | undefined;

  const shouldShowBalance =
    config.showBalanceIndicator &&
    (!config.showDirection || direction === 'DECREASE');

  useEffect(() => {
    if (open) {
      reset(config.defaultValues);
      setFormError(null);
      setSelectedProduct(null);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const mutation = useCreateMovement(
    config.endpoint,
    (_data, variables) => {
      const loc = locations.find((l) => l.id === (variables[locationFieldName] as string));
      toast.success(
        config.getSuccessToast({
          quantity: variables.quantity as number,
          productName: selectedProduct?.name ?? '',
          locationName: loc?.name ?? '',
          direction: variables.direction as string | undefined,
        }),
      );
      onClose();
    },
    (err) => {
      setFormError(parseApiError(err));
    },
  );

  function onSubmit(values: FieldValues) {
    setFormError(null);
    mutation.mutate(values);
  }

  const pending = mutation.isPending;

  const footer = (
    <div className="flex items-center justify-between">
      <div>
        {formError && (
          <p className="text-[13px] font-sans text-ink-500 dark:text-ink-400">{formError}</p>
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
        <button
          type="submit"
          form="operation-form"
          disabled={pending}
          className="h-10 px-6 bg-ink-900 dark:bg-ink-50 text-white dark:text-ink-900 font-sans font-medium text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {pending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );

  return (
    <SideSheet open={open} onClose={onClose} title={config.title} footer={footer}>
      <form id="operation-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-6">
          {/* Product */}
          <ProductPicker
            value={productId ?? null}
            onChange={(product) => {
              setSelectedProduct(product);
              setValue('productId', product.id, { shouldValidate: true });
            }}
            error={errors.productId?.message as string | undefined}
          />

          {/* Location */}
          <Field
            label={config.locationKind === 'to' ? 'To location' : config.locationKind === 'from' ? 'From location' : 'Location'}
            error={errors[locationFieldName]?.message as string | undefined}
          >
            <EditorialSelect
              {...register(locationFieldName)}
              placeholder="Select a location"
              options={locationOptions}
              className="w-full"
            />
          </Field>

          {/* Direction toggle (Adjust only) */}
          {config.showDirection && (
            <div className="space-y-1">
              <label className="eyebrow text-ink-500 dark:text-ink-400">Direction</label>
              <div className="flex items-center gap-0 pt-1">
                {(['INCREASE', 'DECREASE'] as const).map((d, i) => (
                  <span key={d} className="flex items-center">
                    {i > 0 && (
                      <span className="mx-5 text-ink-300 dark:text-ink-600 select-none">·</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setValue('direction', d, { shouldValidate: true })}
                      className={cn(
                        'font-sans text-sm transition-colors',
                        direction === d
                          ? 'font-medium text-ink-900 dark:text-ink-50'
                          : 'font-normal text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-300',
                      )}
                    >
                      {d === 'INCREASE' ? 'Increase' : 'Decrease'}
                    </button>
                  </span>
                ))}
              </div>
              {errors.direction?.message && (
                <p className="text-[13px] font-sans text-ink-500 dark:text-ink-400 mt-1">
                  {errors.direction.message as string}
                </p>
              )}
            </div>
          )}

          {/* Quantity */}
          <div>
            <Field label="Quantity" error={errors.quantity?.message as string | undefined}>
              <input
                {...register('quantity')}
                type="number"
                min="1"
                className={INPUT_BASE}
                placeholder="0"
              />
            </Field>
            {shouldShowBalance && (
              <BalanceIndicator
                productId={productId}
                locationId={locationId}
                enteredQuantity={quantity}
              />
            )}
          </div>

          {/* Reference number */}
          <Field
            label={config.referenceRequired ? 'Reference number' : 'Reference number (optional)'}
            hint={config.referenceHint}
            error={errors.referenceNumber?.message as string | undefined}
          >
            <input
              {...register('referenceNumber')}
              type="text"
              className={INPUT_BASE}
              placeholder={
                config.referenceRequired
                  ? 'Required for audit trail'
                  : 'e.g. invoice or PO number'
              }
            />
          </Field>

          {/* Notes */}
          <Field
            label="Notes (optional)"
            hint={config.notesHint}
            error={errors.notes?.message as string | undefined}
          >
            <textarea
              {...register('notes')}
              rows={3}
              className={TEXTAREA_BASE}
              placeholder="Additional notes…"
            />
          </Field>
        </div>
      </form>
    </SideSheet>
  );
}
