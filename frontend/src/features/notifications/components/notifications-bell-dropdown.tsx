import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/lib/cn';
import { useUnreadCount } from '../hooks/use-unread-count';
import { useNotifications } from '../hooks/use-notifications';
import { useMarkAllRead } from '../hooks/use-mark-all-read';
import { NotificationRow } from './notification-row';

export function NotificationsBellDropdown() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data: countData } = useUnreadCount(true);
  const { data: page } = useNotifications({ limit: 10 });
  const notifications = page?.data;
  const markAll = useMarkAllRead();

  const unread = countData?.count ?? 0;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-1.5 text-ink-400 hover:text-ink-900 dark:text-ink-500 dark:hover:text-ink-50 transition-colors"
        >
          <Bell size={16} strokeWidth={1.5} />
          {unread > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 flex items-center justify-center rounded-full bg-ink-900 dark:bg-ink-50 text-ink-50 dark:text-ink-900 text-[9px] font-sans font-semibold px-0.5 leading-none">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className={cn(
            'w-80 max-h-[480px] flex flex-col',
            'bg-ink-50 dark:bg-ink-900',
            'border border-ink-900/15 dark:border-ink-50/15',
            'shadow-lg',
            'z-50',
            'overflow-hidden',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-900/10 dark:border-ink-50/10 shrink-0">
            <p className="text-sm font-sans font-medium text-ink-900 dark:text-ink-50">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
                className="eyebrow text-ink-400 hover:text-ink-900 dark:hover:text-ink-50 transition-colors disabled:opacity-50"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {!notifications || notifications.length === 0 ? (
              <p className="text-sm font-sans text-ink-400 dark:text-ink-500 text-center py-8">
                No notifications
              </p>
            ) : (
              notifications.map((n) => <NotificationRow key={n.id} notification={n} />)
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-ink-900/10 dark:border-ink-50/10 shrink-0">
            <button
              type="button"
              onClick={() => { setOpen(false); navigate('/notifications'); }}
              className="w-full text-xs font-sans text-ink-400 hover:text-ink-900 dark:hover:text-ink-50 transition-colors text-center"
            >
              View all notifications
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
