import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pauseQueue } from '../api/jobs.api';

export function usePauseQueue(queueName: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => pauseQueue(queueName),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs', 'queues'] });
    },
  });
}
