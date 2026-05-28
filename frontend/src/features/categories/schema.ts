import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, 'At least 2 characters').max(100, 'Max 100 characters'),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
