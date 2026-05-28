import { fmtDateTime } from '@/lib/format';
import type { Transfer } from '@/types/api';

interface TimelineEvent {
  marker: string;
  label: string;
  detail?: string;
  time?: string;
}

function buildEvents(transfer: Transfer): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  events.push({
    marker: '●',
    label: 'Created',
    detail: transfer.creator
      ? `by ${transfer.creator.fullName}`
      : undefined,
    time: fmtDateTime(transfer.createdAt),
  });

  const submitted =
    transfer.status !== 'DRAFT' &&
    transfer.status !== 'CANCELLED';

  if (submitted) {
    events.push({
      marker: '○',
      label: 'Submitted for approval',
    });
  }

  if (transfer.approvedAt && transfer.status === 'APPROVED') {
    events.push({
      marker: '●',
      label: 'Approved',
      detail: transfer.approver ? `by ${transfer.approver.fullName}` : undefined,
      time: fmtDateTime(transfer.approvedAt),
    });
  }

  if (transfer.approvedAt && transfer.status === 'REJECTED') {
    events.push({
      marker: '○',
      label: 'Rejected',
      detail: transfer.approver ? `by ${transfer.approver.fullName}` : undefined,
      time: fmtDateTime(transfer.approvedAt),
    });
    if (transfer.rejectionReason) {
      events.push({
        marker: ' ',
        label: `"${transfer.rejectionReason}"`,
      });
    }
  }

  if (transfer.status === 'CANCELLED') {
    events.push({
      marker: '○',
      label: 'Cancelled',
    });
  }

  if (transfer.completedAt) {
    events.push({
      marker: '●',
      label: 'Completed',
      time: fmtDateTime(transfer.completedAt),
    });
  }

  return events;
}

interface TransferTimelineProps {
  transfer: Transfer;
}

export function TransferTimeline({ transfer }: TransferTimelineProps) {
  const events = buildEvents(transfer);

  return (
    <div className="space-y-4">
      {events.map((event, i) => (
        <div key={i} className="flex items-start gap-3">
          <span className="text-ink-400 dark:text-ink-500 text-xs mt-0.5 w-3 shrink-0 select-none">
            {event.marker}
          </span>
          <div className="min-w-0">
            <span className="text-sm font-sans text-ink-900 dark:text-ink-100">
              {event.label}
            </span>
            {event.detail && (
              <span className="text-sm font-sans text-ink-400 dark:text-ink-500">
                {' '}{event.detail}
              </span>
            )}
            {event.time && (
              <p className="eyebrow text-ink-400 dark:text-ink-500 mt-0.5">{event.time}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
