import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Movement } from '@/types/api';
import type { FieldValues } from 'react-hook-form';
import { postMovement } from '../api/inventory.api';

export function useCreateMovement(
  endpoint: string,
  onSuccess: (data: Movement, variables: FieldValues) => void,
  onError: (err: unknown) => void,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: FieldValues) => postMovement(endpoint, body),
    onSuccess: (data, variables) => {
      void qc.invalidateQueries({ queryKey: ['movements'] });
      void qc.invalidateQueries({ queryKey: ['balances'] });
      void qc.invalidateQueries({ queryKey: ['balance'] });
      void qc.invalidateQueries({ queryKey: ['reports'] });
      onSuccess(data, variables);
    },
    onError,
  });
}
