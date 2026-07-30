import React from 'react';
import { BellOff } from 'lucide-react';

interface NotificationEmptyStateProps {
  filterUnread?: boolean;
}

export const NotificationEmptyState: React.FC<NotificationEmptyStateProps> = ({ filterUnread }) => {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-2">
        <BellOff size={18} />
      </div>
      <p className="text-xs font-medium text-zinc-300">
        {filterUnread ? 'No unread notifications' : 'No notifications yet'}
      </p>
      <p className="text-[11px] text-zinc-500 max-w-[200px] mt-1">
        {filterUnread
          ? 'You are all caught up! Switch to All tab to view history.'
          : 'You will receive notifications here when tasks, comments, or projects are updated.'}
      </p>
    </div>
  );
};
