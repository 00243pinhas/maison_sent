import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createProduct, updateProduct, deleteProduct } from '../api/products.api';
import { parseApiError } from '@/lib/parse-error';
import type { ProductFormValues } from '../schema';

export function useCreateProduct(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProductFormValues) => createProduct(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created.');
      onSuccess?.();
    },
    onError: (err) => toast.error(parseApiError(err)),
  });
}

export function useUpdateProduct(id: string, onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<ProductFormValues>) => updateProduct(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product saved.');
      onSuccess?.();
    },
    onError: (err) => toast.error(parseApiError(err)),
  });
}

export function useDeleteProduct(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted.');
      onSuccess?.();
    },
    onError: (err) => toast.error(parseApiError(err)),
  });
}
