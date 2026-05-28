import { useQuery } from '@tanstack/react-query';
import { getQueueStats } from '../api/jobs.api';

export function useQueueStats() {
  return useQuery({
    queryKey: ['jobs', 'queues'],
    queryFn: getQueueStats,
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
  });
}
