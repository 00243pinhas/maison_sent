import { z } from 'zod';

export const supplierSchema = z.object({
  name: z.string().min(2, 'At least 2 characters').max(150, 'Max 150 characters'),
  phone: z
    .string()
    .max(30)
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  email: z
    .string()
    .optional()
    .transform((v) => (v === '' ? undefined : v))
    .pipe(z.string().email('Enter a valid email').optional()),
  country: z
    .string()
    .max(100)
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
