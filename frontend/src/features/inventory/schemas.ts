import { z } from 'zod';

const optionalText = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .transform((v) => (v === '' ? undefined : v));

export const receiveSchema = z.object({
  productId: z.string().uuid('Select a product'),
  toLocationId: z.string().uuid('Select a location'),
  quantity: z.coerce.number().int('Must be a whole number').min(1, 'At least 1'),
  referenceNumber: optionalText(80),
  notes: optionalText(500),
});

export const saleSchema = z.object({
  productId: z.string().uuid('Select a product'),
  fromLocationId: z.string().uuid('Select a location'),
  quantity: z.coerce.number().int('Must be a whole number').min(1, 'At least 1'),
  referenceNumber: optionalText(80),
  notes: optionalText(500),
});

export const returnSchema = z.object({
  productId: z.string().uuid('Select a product'),
  toLocationId: z.string().uuid('Select a location'),
  quantity: z.coerce.number().int('Must be a whole number').min(1, 'At least 1'),
  referenceNumber: optionalText(80),
  notes: optionalText(500),
});

export const damageSchema = z.object({
  productId: z.string().uuid('Select a product'),
  fromLocationId: z.string().uuid('Select a location'),
  quantity: z.coerce.number().int('Must be a whole number').min(1, 'At least 1'),
  referenceNumber: optionalText(80),
  notes: optionalText(500),
});

export const adjustSchema = z.object({
  productId: z.string().uuid('Select a product'),
  locationId: z.string().uuid('Select a location'),
  direction: z.enum(['INCREASE', 'DECREASE']),
  quantity: z.coerce.number().int('Must be a whole number').min(1, 'At least 1'),
  referenceNumber: z.string().min(1, 'Reference is required for audit trail').max(80),
  notes: optionalText(500),
});

export type ReceiveValues = z.infer<typeof receiveSchema>;
export type SaleValues = z.infer<typeof saleSchema>;
export type ReturnValues = z.infer<typeof returnSchema>;
export type DamageValues = z.infer<typeof damageSchema>;
export type AdjustValues = z.infer<typeof adjustSchema>;
