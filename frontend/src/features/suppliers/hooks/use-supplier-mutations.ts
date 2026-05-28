import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createSupplier, updateSupplier, deleteSupplier } from '../api/suppliers.api';
import { parseApiError } from '@/lib/parse-error';
import type { SupplierFormValues } from '../schema';

export function useCreateSupplier(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SupplierFormValues) => createSupplier(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier created.');
      onSuccess?.();
    },
    onError: (err) => toast.error(parseApiError(err)),
  });
}

export function useUpdateSupplier(id: string, onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<SupplierFormValues>) => updateSupplier(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier saved.');
      onSuccess?.();
    },
    onError: (err) => toast.error(parseApiError(err)),
  });
}

export function useDeleteSupplier(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier deleted.');
      onSuccess?.();
    },
    onError: (err) => toast.error(parseApiError(err)),
  });
}
