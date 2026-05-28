import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createCategory, updateCategory, deleteCategory } from '../api/categories.api';
import { parseApiError } from '@/lib/parse-error';
import type { CategoryFormValues } from '../schema';

export function useCreateCategory(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CategoryFormValues) => createCategory(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created.');
      onSuccess?.();
    },
    onError: (err) => toast.error(parseApiError(err)),
  });
}

export function useUpdateCategory(id: string, onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<CategoryFormValues>) => updateCategory(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category saved.');
      onSuccess?.();
    },
    onError: (err) => toast.error(parseApiError(err)),
  });
}

export function useDeleteCategory(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted.');
      onSuccess?.();
    },
    onError: (err) => toast.error(parseApiError(err)),
  });
}
