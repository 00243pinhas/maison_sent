import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { fmtDateTime } from '@/lib/format';
import type { Notification } from '@/types/api';
import { useMarkRead } from '../hooks/use-mark-read';
import { useDeleteNotification } from '../hooks/use-delete-notification';

interface NotificationRowProps {
  notification: Notification;
}

export function NotificationRow({ notification }: NotificationRowProps) {
  const markRead = useMarkRead();
  const deleteNotif = useDeleteNotification();

  function handleClick() {
    if (!notification.read) {
      markRead.mutate(notification.id);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      className={cn(
        'group flex items-start gap-3 px-4 py-3 border-b border-ink-900/10 dark:border-ink-50/10 last:border-0 cursor-pointer transition-colors',
        notification.read
          ? 'hover:bg-ink-900/[0.02] dark:hover:bg-ink-50/[0.02]'
          : 'bg-ink-900/[0.03] dark:bg-ink-50/[0.03] hover:bg-ink-900/[0.05] dark:hover:bg-ink-50/[0.05]',
      )}
    >
      {/* Unread dot */}
      <div className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-ink-900 dark:bg-ink-50" style={{ opacity: notification.read ? 0 : 1 }} />

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-sans leading-snug', notification.read ? 'text-ink-600 dark:text-ink-400' : 'font-medium text-ink-900 dark:text-ink-50')}>
          {notification.title}
        </p>
        <p className="text-xs font-sans text-ink-400 dark:text-ink-500 mt-0.5 leading-snug">{notification.message}</p>
        <p className="eyebrow text-ink-300 dark:text-ink-600 mt-1">{fmtDateTime(notification.createdAt)}</p>
      </div>

      <button
        type="button"
        aria-label="Delete notification"
        onClick={(e) => { e.stopPropagation(); deleteNotif.mutate(notification.id); }}
        className="shrink-0 mt-0.5 p-1 text-ink-300 dark:text-ink-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 size={13} strokeWidth={1.5} />
      </button>
    </div>
  );
}
