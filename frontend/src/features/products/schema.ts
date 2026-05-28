import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'At least 2 characters').max(200),
  brand: z.string().min(2, 'At least 2 characters').max(150),
  sku: z
    .string()
    .min(1, 'SKU is required')
    .max(64, 'Max 64 characters')
    .regex(/^[A-Z0-9_-]+$/i, 'Alphanumeric, dashes and underscores only'),
  barcode: z
    .string()
    .max(64)
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  categoryId: z.string().uuid('Select a category'),
  supplierId: z.string().uuid('Select a supplier'),
  costPrice: z.coerce.number().nonnegative('Must be 0 or more'),
  sellingPrice: z.coerce.number().nonnegative('Must be 0 or more'),
  sizeMl: z.coerce.number().int('Must be a whole number').min(1, 'At least 1 ml'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']),
  lowStockThreshold: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v === '') return null;
      const n = parseInt(v, 10);
      return isNaN(n) ? null : n;
    }),
});

export type ProductFormValues = z.infer<typeof productSchema>;
