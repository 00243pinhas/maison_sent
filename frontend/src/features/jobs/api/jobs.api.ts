import api from '@/lib/api';
import type { QueueStats, QueueStatsResponse, FailedJob, ScheduledJobResult } from '@/types/api';

export async function getQueueStats(): Promise<QueueStats[]> {
  const { data } = await api.get<QueueStatsResponse>('/jobs/queues');
  // Backend returns { notifications: {...}, scheduled: {...} } — normalise to array
  return [data.notifications, data.scheduled];
}

export async function getFailedJobs(queueName: string): Promise<FailedJob[]> {
  const { data } = await api.get<FailedJob[]>(`/jobs/queues/${queueName}/failed`);
  return data;
}

export async function retryFailed(queueName: string): Promise<void> {
  await api.post(`/jobs/queues/${queueName}/retry-failed`);
}

export async function pauseQueue(queueName: string): Promise<void> {
  await api.post(`/jobs/queues/${queueName}/pause`);
}

export async function resumeQueue(queueName: string): Promise<void> {
  await api.post(`/jobs/queues/${queueName}/resume`);
}

export async function runScheduledNow(jobName: string): Promise<ScheduledJobResult> {
  const { data } = await api.post<ScheduledJobResult>(`/jobs/scheduled/${jobName}/run-now`);
  return data;
}
