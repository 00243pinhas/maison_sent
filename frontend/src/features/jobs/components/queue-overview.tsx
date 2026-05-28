import { QueueBlock } from './queue-block';
import type { QueueStats } from '@/types/api';

interface QueueOverviewProps {
  queues: QueueStats[];
}

export function QueueOverview({ queues }: QueueOverviewProps) {
  if (queues.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm font-sans text-ink-400 dark:text-ink-500">Loading queue stats…</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {queues.map((queue) => (
        <QueueBlock key={queue.name} queue={queue} />
      ))}
    </div>
  );
}
