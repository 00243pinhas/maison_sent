import { useQuery } from '@tanstack/react-query';
import { getFailedJobs } from '../api/jobs.api';

export function useFailedJobs(queueName: string) {
  return useQuery({
    queryKey: ['jobs', 'failed', queueName],
    queryFn: () => getFailedJobs(queueName),
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
  });
}
