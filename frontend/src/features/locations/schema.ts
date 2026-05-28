import { z } from 'zod';

export const locationSchema = z.object({
  name: z.string().min(2, 'At least 2 characters').max(150, 'Max 150 characters'),
  type: z.enum(['WAREHOUSE', 'BRANCH', 'HEAD_OFFICE']),
  city: z
    .string()
    .max(100)
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  address: z
    .string()
    .max(500)
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
});

export type LocationFormValues = z.infer<typeof locationSchema>;
