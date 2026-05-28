import { useMemo } from 'react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useRunNow } from '../hooks/use-run-now';

interface ScheduledJobConfig {
  name: string;
  label: string;
  cron: string;
}

const SCHEDULED_JOBS_CONFIG: ScheduledJobConfig[] = [
  { name: 'low-stock-digest', label: 'Daily low-stock digest', cron: '0 8 * * *' },
  { name: 'stale-transfer-reminder', label: 'Stale transfer reminder', cron: '0 */6 * * *' },
];

function getNextRun(cronExpr: string): Date {
  const now = new Date();
  if (cronExpr === '0 8 * * *') {
    const next = new Date(now);
    next.setHours(8, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next;
  }
  // 0 */6 * * * — fires at 00:00, 06:00, 12:00, 18:00
  const hours = [0, 6, 12, 18];
  const currentHour = now.getHours();
  const nextHour = hours.find((h) => h > currentHour);
  const next = new Date(now);
  if (nextHour === undefined) {
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
  } else {
    next.setHours(nextHour, 0, 0, 0);
  }
  return next;
}

function ScheduledJobRow({ config }: { config: ScheduledJobConfig }) {
  const nextRun = useMemo(() => getNextRun(config.cron), [config.cron]);
  const runNow = useRunNow(config.name);

  function handleRunNow() {
    runNow.mutate(undefined, {
      onSuccess: (result) => {
        const parts = Object.entries(result)
          .map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${String(v)}`)
          .join(' · ');
        toast.success(parts || 'Job completed.');
      },
      onError: () => {
        toast.error('Failed to run job. Check server logs.');
      },
    });
  }

  return (
    <div className="flex items-center justify-between py-4 border-b border-ink-900/5 dark:border-ink-50/5 last:border-0">
      <div>
        <p className="text-sm font-sans font-medium text-ink-900 dark:text-ink-50">{config.label}</p>
        <p className="eyebrow text-ink-400 dark:text-ink-600 mt-0.5">
          cron: {config.cron} (Africa/Harare)
        </p>
      </div>
      <div className="flex items-center gap-6">
        <p className="text-sm font-sans text-ink-400 dark:text-ink-500">
          next run in {formatDistanceToNow(nextRun)}
        </p>
        <button
          type="button"
          onClick={handleRunNow}
          disabled={runNow.isPending}
          className="text-sm font-sans text-ink-400 dark:text-ink-500 hover:text-ink-900 dark:hover:text-ink-50 disabled:opacity-50 transition-colors"
        >
          {runNow.isPending ? 'Running…' : 'Run now'}
        </button>
      </div>
    </div>
  );
}

export function ScheduledJobsSection() {
  return (
    <div className="px-8 py-8">
      <p className="eyebrow text-ink-400 dark:text-ink-600 mb-6">02 SCHEDULED JOBS</p>
      {SCHEDULED_JOBS_CONFIG.map((config) => (
        <ScheduledJobRow key={config.name} config={config} />
      ))}
    </div>
  );
}
