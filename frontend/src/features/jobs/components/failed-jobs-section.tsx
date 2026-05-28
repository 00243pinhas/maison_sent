import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { TabToggle } from '@/components/ui/tab-toggle';
import { useFailedJobs } from '../hooks/use-failed-jobs';
import { useRetryFailed } from '../hooks/use-retry-failed';
import { fmtDateTime } from '@/lib/format';

const TABS = [
  { id: 'notifications', label: 'Notifications' },
  { id: 'scheduled', label: 'Scheduled' },
];

export function FailedJobsSection() {
  const [activeQueue, setActiveQueue] = useState('notifications');
  const [confirmRetry, setConfirmRetry] = useState(false);

  const { data: jobs = [] } = useFailedJobs(activeQueue);
  const retryMutation = useRetryFailed(activeQueue);

  const failedCount = jobs.length;

  return (
    <>
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <p className="eyebrow text-ink-400 dark:text-ink-600">01 FAILED JOBS</p>
            <TabToggle tabs={TABS} activeId={activeQueue} onChange={setActiveQueue} />
          </div>
          {failedCount > 0 && (
            <button
              type="button"
              onClick={() => setConfirmRetry(true)}
              className="text-sm font-sans text-ink-400 dark:text-ink-500 hover:text-ink-900 dark:hover:text-ink-50 transition-colors border border-ink-900/15 dark:border-ink-50/15 px-3 h-7"
            >
              Retry all failed
            </button>
          )}
        </div>

        {jobs.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-serif text-2xl font-medium text-ink-900 dark:text-ink-50 mb-2">
              No failed jobs
            </p>
            <p className="text-sm font-sans text-ink-400 dark:text-ink-500">
              Workers are healthy.
            </p>
          </div>
        ) : (
          <div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-900/10 dark:border-ink-50/10">
                  <th className="text-left eyebrow text-ink-400 dark:text-ink-600 pb-3 pr-4 font-normal">FAILED AT</th>
                  <th className="text-left eyebrow text-ink-400 dark:text-ink-600 pb-3 pr-4 font-normal">JOB</th>
                  <th className="text-left eyebrow text-ink-400 dark:text-ink-600 pb-3 pr-4 font-normal">REASON</th>
                  <th className="text-right eyebrow text-ink-400 dark:text-ink-600 pb-3 font-normal">ATTEMPTS</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-ink-900/5 dark:border-ink-50/5 hover:bg-ink-900/[0.02] dark:hover:bg-ink-50/[0.02]"
                  >
                    <td className="py-3 pr-4 text-sm font-sans text-ink-600 dark:text-ink-400 whitespace-nowrap">
                      {fmtDateTime(new Date(job.timestamp))}
                    </td>
                    <td className="py-3 pr-4 text-sm font-sans text-ink-900 dark:text-ink-50">
                      {job.name}
                    </td>
                    <td
                      className="py-3 pr-4 text-sm font-sans text-ink-500 dark:text-ink-400 max-w-xs truncate"
                      title={job.failedReason}
                    >
                      {job.failedReason}
                    </td>
                    <td className="py-3 text-right text-sm font-sans text-ink-500 dark:text-ink-400 tabular-nums">
                      {job.attemptsMade} of 3
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {jobs.length === 50 && (
              <p className="mt-3 text-xs font-sans text-ink-400 dark:text-ink-600">
                Showing 50 most recent. More may exist in Redis.
              </p>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmRetry}
        onClose={() => setConfirmRetry(false)}
        onConfirm={() => {
          retryMutation.mutate(undefined, {
            onSuccess: () => {
              setConfirmRetry(false);
              toast.success(`Retried ${failedCount} failed job${failedCount !== 1 ? 's' : ''} in the ${activeQueue} queue.`);
            },
          });
        }}
        loading={retryMutation.isPending}
        title={`Retry ${failedCount} failed job${failedCount !== 1 ? 's' : ''}?`}
        description={`All failed jobs in the ${activeQueue} queue will be requeued for processing.`}
        confirmLabel="Retry all"
      />
    </>
  );
}
