import React from 'react';
import { Bell, X } from 'lucide-react';
import { NotificationItemData, NotificationEntityType } from '../../../types/notification';
import { NotificationList } from './NotificationList';
import { useTaskUiStore } from '../../../stores/taskUi.store';
import { apiClient } from '../../../config/api.client';
import { AuthApiResponse } from '../../../types/auth';
import { useNavigate } from 'react-router-dom';

interface NotificationDropdownProps {
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { openDrawer } = useTaskUiStore();
  const navigate = useNavigate();

  const handleSelectNotification = async (notification: NotificationItemData) => {
    onClose();

    // Deep linking for Invitations
    if (notification.entityType === NotificationEntityType.INVITATION) {
      const token = notification.metadata?.token;
      if (token && typeof token === 'string') {
        navigate(`/invitations/accept?token=${token}`);
        return;
      }
    }

    // Deep linking logic for Tasks
    const taskId =
      notification.entityType === NotificationEntityType.TASK
        ? notification.entityId
        : (notification.metadata?.taskId as string | undefined);

    if (taskId) {
      try {
        const res = await apiClient.get<unknown, AuthApiResponse<{ task: any }>>(`/tasks/${taskId}`);
        if (res.success && res.data?.task) {
          openDrawer(res.data.task);
        }
      } catch {
        // Silently ignore if task was archived or deleted
      }
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0e0e12] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Popover Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-950">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-indigo-400" />
          <h3 className="text-xs font-bold text-white tracking-wide">Notifications</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
          aria-label="Close notification dropdown"
        >
          <X size={14} />
        </button>
      </div>

      {/* Popover Content */}
      <NotificationList onSelectNotification={handleSelectNotification} />
    </div>
  );
};
