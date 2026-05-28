import { useMutation, useQueryClient } from '@tanstack/react-query';
import { retryFailed } from '../api/jobs.api';

export function useRetryFailed(queueName: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => retryFailed(queueName),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs', 'queues'] });
      void queryClient.invalidateQueries({ queryKey: ['jobs', 'failed', queueName] });
    },
  });
}
