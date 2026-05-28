import { useMutation, useQueryClient } from '@tanstack/react-query';
import { runScheduledNow } from '../api/jobs.api';

export function useRunNow(jobName: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => runScheduledNow(jobName),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['jobs', 'queues'] });
    },
  });
}
