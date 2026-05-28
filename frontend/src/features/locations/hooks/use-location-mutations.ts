import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createLocation, updateLocation, deleteLocation } from '../api/locations.api';
import { parseApiError } from '@/lib/parse-error';
import type { LocationFormValues } from '../schema';

export function useCreateLocation(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LocationFormValues) => createLocation(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location created.');
      onSuccess?.();
    },
    onError: (err) => toast.error(parseApiError(err)),
  });
}

export function useUpdateLocation(id: string, onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<LocationFormValues>) => updateLocation(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location saved.');
      onSuccess?.();
    },
    onError: (err) => toast.error(parseApiError(err)),
  });
}

export function useDeleteLocation(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLocation(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location deleted.');
      onSuccess?.();
    },
    onError: (err) => toast.error(parseApiError(err)),
  });
}
