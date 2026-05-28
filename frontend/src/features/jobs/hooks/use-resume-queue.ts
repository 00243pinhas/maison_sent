import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeQueue } from '../api/jobs.api';

export function useResumeQueue(queueName: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => resumeQueue(queueName),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs', 'queues'] });
    },
  });
}
