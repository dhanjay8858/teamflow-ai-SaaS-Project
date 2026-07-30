import React, { useState } from 'react';
import { CheckCheck, Loader2 } from 'lucide-react';
import { NotificationItemData } from '../../../types/notification';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { NotificationSkeleton } from './NotificationSkeleton';
import { NotificationEmptyState } from './NotificationEmptyState';

interface NotificationListProps {
  onSelectNotification?: (notification: NotificationItemData) => void;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  onSelectNotification,
}) => {
  const [filterUnread, setFilterUnread] = useState(false);
  const {
    notificationsQuery,
    unreadCount,
    markAllReadMutation,
  } = useNotifications();

  const pages = notificationsQuery.data?.pages || [];
  const allNotifications = pages.flatMap((p) => p.data?.notifications || []);

  const filteredNotifications = filterUnread
    ? allNotifications.filter((n) => !n.isRead)
    : allNotifications;

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  return (
    <div className="flex flex-col h-full max-h-[480px]">
      {/* Tab Filter Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/80 bg-zinc-950/80">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterUnread(false)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              !filterUnread
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterUnread(true)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              filterUnread
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors disabled:opacity-50"
            title="Mark all as read"
          >
            <CheckCheck size={13} />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-[220px]">
        {notificationsQuery.isLoading ? (
          <NotificationSkeleton />
        ) : filteredNotifications.length === 0 ? (
          <NotificationEmptyState filterUnread={filterUnread} />
        ) : (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onSelect={onSelectNotification}
            />
          ))
        )}

        {/* Load More Button */}
        {notificationsQuery.hasNextPage && (
          <div className="pt-2 text-center">
            <button
              onClick={() => notificationsQuery.fetchNextPage()}
              disabled={notificationsQuery.isFetchingNextPage}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              {notificationsQuery.isFetchingNextPage ? (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  <span>Loading…</span>
                </>
              ) : (
                <span>Load older notifications</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
