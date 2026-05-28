import { useState } from 'react';
import { SkeletonLine } from '@/components/ui/Skeleton';
import { useNotifications } from '../hooks/use-notifications';
import { useMarkAllRead } from '../hooks/use-mark-all-read';
import { NotificationRow } from '../components/notification-row';

const PAGE_SIZE = 20;

export function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data: paginated, isLoading } = useNotifications({
    read: unreadOnly ? false : undefined,
    page,
    limit: PAGE_SIZE,
  });
  const markAll = useMarkAllRead();

  const notifications = paginated?.data ?? [];
  const totalPages = paginated?.totalPages ?? 1;

  return (
    <div className="px-8 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-medium text-ink-900 dark:text-ink-50">Notifications</h1>
          <p className="eyebrow text-ink-400 dark:text-ink-500 mt-1">Activity and alerts</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => { setUnreadOnly((v) => !v); setPage(1); }}
            className={`eyebrow transition-colors ${unreadOnly ? 'text-ink-900 dark:text-ink-50' : 'text-ink-400 dark:text-ink-500 hover:text-ink-900 dark:hover:text-ink-50'}`}
          >
            {unreadOnly ? 'Unread only' : 'All'}
          </button>
          <button
            type="button"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="eyebrow text-ink-400 hover:text-ink-900 dark:hover:text-ink-50 transition-colors disabled:opacity-50"
          >
            Mark all read
          </button>
        </div>
      </div>

      <div className="border border-ink-900/10 dark:border-ink-50/10">
        {isLoading && (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonLine key={i} className="h-12 w-full" />)}
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <p className="text-sm font-sans text-ink-400 dark:text-ink-500 text-center py-12">
            {unreadOnly ? 'No unread notifications' : 'No notifications'}
          </p>
        )}

        {!isLoading && notifications.length > 0 && (
          notifications.map((n) => <NotificationRow key={n.id} notification={n} />)
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="eyebrow text-ink-400 hover:text-ink-900 dark:hover:text-ink-50 transition-colors disabled:opacity-30"
          >
            Previous
          </button>
          <p className="eyebrow text-ink-400 dark:text-ink-500">Page {page} of {totalPages}</p>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="eyebrow text-ink-400 hover:text-ink-900 dark:hover:text-ink-50 transition-colors disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
