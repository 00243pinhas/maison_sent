import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { usePauseQueue } from '../hooks/use-pause-queue';
import { useResumeQueue } from '../hooks/use-resume-queue';
import type { QueueStats } from '@/types/api';

interface QueueBlockProps {
  queue: QueueStats;
}

const STAT_LABELS: Array<{ key: keyof Omit<QueueStats, 'name'>; label: string }> = [
  { key: 'waiting', label: 'WAITING' },
  { key: 'active', label: 'ACTIVE' },
  { key: 'completed', label: 'COMPLETED' },
  { key: 'failed', label: 'FAILED' },
  { key: 'delayed', label: 'DELAYED' },
  { key: 'paused', label: 'PAUSED' },
];

export function QueueBlock({ queue }: QueueBlockProps) {
  const [confirmPause, setConfirmPause] = useState(false);
  const [confirmResume, setConfirmResume] = useState(false);
  const pauseMutation = usePauseQueue(queue.name);
  const resumeMutation = useResumeQueue(queue.name);

  return (
    <>
      <div className="flex-1 border border-ink-900/10 dark:border-ink-50/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="eyebrow text-ink-500 dark:text-ink-400">
            {queue.name.toUpperCase()}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmPause(true)}
              disabled={pauseMutation.isPending}
              className="text-sm font-sans text-ink-400 dark:text-ink-500 hover:text-ink-900 dark:hover:text-ink-50 disabled:opacity-50 transition-colors border border-ink-900/15 dark:border-ink-50/15 px-3 h-7"
            >
              {pauseMutation.isPending ? '…' : 'Pause'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmResume(true)}
              disabled={resumeMutation.isPending}
              className="text-sm font-sans text-ink-400 dark:text-ink-500 hover:text-ink-900 dark:hover:text-ink-50 disabled:opacity-50 transition-colors border border-ink-900/15 dark:border-ink-50/15 px-3 h-7"
            >
              {resumeMutation.isPending ? '…' : 'Resume'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-x-6 gap-y-4 sm:grid-cols-6">
          {STAT_LABELS.map(({ key, label }) => (
            <div key={key}>
              <p className="eyebrow text-ink-400 dark:text-ink-600 mb-1">{label}</p>
              <p className="font-serif text-2xl font-medium text-ink-900 dark:text-ink-50 tabular-nums">
                {queue[key]}
              </p>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        open={confirmPause}
        onClose={() => setConfirmPause(false)}
        onConfirm={() => {
          pauseMutation.mutate(undefined, {
            onSuccess: () => {
              setConfirmPause(false);
              toast.success(`${queue.name} queue paused.`);
            },
          });
        }}
        loading={pauseMutation.isPending}
        title={`Pause ${queue.name} queue?`}
        description="Pausing will stop workers from picking up new jobs. Jobs already in flight will complete. Resume when ready."
        confirmLabel="Pause"
      />

      <ConfirmModal
        open={confirmResume}
        onClose={() => setConfirmResume(false)}
        onConfirm={() => {
          resumeMutation.mutate(undefined, {
            onSuccess: () => {
              setConfirmResume(false);
              toast.success(`${queue.name} queue resumed.`);
            },
          });
        }}
        loading={resumeMutation.isPending}
        title={`Resume ${queue.name} queue?`}
        description="Workers will begin processing queued jobs immediately."
        confirmLabel="Resume"
      />
    </>
  );
}
