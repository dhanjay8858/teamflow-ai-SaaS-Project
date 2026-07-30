import React from 'react';
import {
  CheckSquare,
  MessageSquare,
  AtSign,
  Paperclip,
  FolderPlus,
  UserPlus,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { NotificationItemData, NotificationType } from '../../../types/notification';
import { RelativeTime } from './RelativeTime';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationItemProps {
  notification: NotificationItemData;
  onSelect?: (notification: NotificationItemData) => void;
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case NotificationType.TASK_ASSIGNED:
    case NotificationType.TASK_UPDATED:
    case NotificationType.TASK_MOVED:
      return <CheckSquare size={14} className="text-indigo-400" />;
    case NotificationType.TASK_COMPLETED:
      return <CheckCircle2 size={14} className="text-emerald-400" />;
    case NotificationType.COMMENT_CREATED:
    case NotificationType.COMMENT_REPLY:
      return <MessageSquare size={14} className="text-blue-400" />;
    case NotificationType.COMMENT_MENTION:
      return <AtSign size={14} className="text-rose-400" />;
    case NotificationType.FILE_UPLOADED:
      return <Paperclip size={14} className="text-amber-400" />;
    case NotificationType.PROJECT_CREATED:
      return <FolderPlus size={14} className="text-purple-400" />;
    case NotificationType.PROJECT_MEMBER_ADDED:
    case NotificationType.INVITATION_ACCEPTED:
    case NotificationType.WORKSPACE_INVITED:
      return <UserPlus size={14} className="text-teal-400" />;
    default:
      return <CheckSquare size={14} className="text-zinc-400" />;
  }
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onSelect,
}) => {
  const { markReadMutation, deleteNotificationMutation } = useNotifications();

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markReadMutation.mutate(notification._id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(notification._id);
  };

  const handleClick = () => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification._id);
    }
    if (onSelect) {
      onSelect(notification);
    }
  };

  const actorName = notification.actor?.name || 'Someone';

  return (
    <div
      onClick={handleClick}
      className={`
        group relative flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-150 cursor-pointer select-none
        ${notification.isRead
          ? 'bg-zinc-950/40 border-zinc-800/40 opacity-75 hover:bg-zinc-900/60 hover:border-zinc-800'
          : 'bg-zinc-900/90 border-indigo-500/30 hover:border-indigo-500/60 shadow-sm'
        }
      `}
    >
      {/* Unread indicator dot */}
      {!notification.isRead && (
        <span className="absolute left-1 top-3.5 h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
      )}

      {/* Icon Badge */}
      <div className="shrink-0 mt-0.5 h-7 w-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-1 space-y-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-zinc-200 truncate">
            {notification.title}
          </span>
          <RelativeTime dateString={notification.createdAt} />
        </div>
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>
        <span className="text-[10px] text-zinc-500 font-mono">by {actorName}</span>
      </div>

      {/* Hover Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!notification.isRead && (
          <button
            onClick={handleMarkRead}
            title="Mark as read"
            className="p-1 rounded-md text-zinc-500 hover:text-indigo-400 hover:bg-zinc-800 transition-colors"
            aria-label="Mark notification as read"
          >
            <CheckCircle2 size={13} />
          </button>
        )}
        <button
          onClick={handleDelete}
          title="Delete notification"
          className="p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
          aria-label="Delete notification"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};
