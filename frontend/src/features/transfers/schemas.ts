import { z } from 'zod';

const optionalText = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .transform((v) => (v === '' ? undefined : v));

export const newTransferSchema = z
  .object({
    fromLocationId: z.string().min(1, 'Select a from-location'),
    toLocationId: z.string().min(1, 'Select a to-location'),
    referenceNumber: optionalText(80),
    notes: optionalText(500),
  })
  .refine((data) => data.fromLocationId !== data.toLocationId, {
    message: 'From and To locations must be different',
    path: ['toLocationId'],
  });

export type NewTransferValues = z.infer<typeof newTransferSchema>;

export const transferItemSchema = z.object({
  productId: z.string().min(1, 'Select a product'),
  quantity: z.coerce.number().int().min(1, 'Must be at least 1'),
});

export type TransferItemValues = z.infer<typeof transferItemSchema>;
