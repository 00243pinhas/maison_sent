import { PageHeader } from '@/components/ui/page-header';
import { useQueueStats } from '../hooks/use-queue-stats';
import { QueueOverview } from '../components/queue-overview';
import { FailedJobsSection } from '../components/failed-jobs-section';
import { ScheduledJobsSection } from '../components/scheduled-jobs-section';
import { RefreshedIndicator } from '../components/refreshed-indicator';

export function JobsPage() {
  const { data: queues = [], dataUpdatedAt } = useQueueStats();

  return (
    <div>
      <PageHeader
        title="Background jobs"
        subline="Queue health, scheduled tasks, and failed-job recovery"
        action={<RefreshedIndicator dataUpdatedAt={dataUpdatedAt} />}
      />

      <div className="px-8 py-6 border-b border-ink-900/10 dark:border-ink-50/10">
        <QueueOverview queues={queues} />
      </div>

      <div className="border-b border-ink-900/10 dark:border-ink-50/10">
        <FailedJobsSection />
      </div>

      <ScheduledJobsSection />
    </div>
  );
}
