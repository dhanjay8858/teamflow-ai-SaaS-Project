import React from 'react';
import { CheckSquare, Folder, Paperclip, MessageSquare, Activity } from 'lucide-react';
import { CitationItem } from '../../../types/ai';
import { useTaskUiStore } from '../../../stores/taskUi.store';
import { apiClient } from '../../../config/api.client';
import { AuthApiResponse } from '../../../types/auth';

interface CitationCardProps {
  citation: CitationItem;
}

export const SourceBadge: React.FC<{ type: CitationItem['type'] }> = ({ type }) => {
  switch (type) {
    case 'TASK':
      return <CheckSquare size={12} className="text-indigo-400" />;
    case 'PROJECT':
      return <Folder size={12} className="text-purple-400" />;
    case 'FILE':
      return <Paperclip size={12} className="text-amber-400" />;
    case 'COMMENT':
      return <MessageSquare size={12} className="text-blue-400" />;
    case 'ACTIVITY':
      return <Activity size={12} className="text-emerald-400" />;
    default:
      return <CheckSquare size={12} className="text-zinc-400" />;
  }
};

export const CitationCard: React.FC<CitationCardProps> = ({ citation }) => {
  const { openDrawer } = useTaskUiStore();

  const handleClick = async () => {
    if (citation.type === 'TASK') {
      try {
        const res = await apiClient.get<unknown, AuthApiResponse<{ task: any }>>(`/tasks/${citation.id}`);
        if (res.success && res.data?.task) {
          openDrawer(res.data.task);
        }
      } catch {
        // Silently ignore if deleted
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800/80 transition-all cursor-pointer select-none text-[11px] text-zinc-300 font-medium"
      title={`Click to view ${citation.title}`}
    >
      <SourceBadge type={citation.type} />
      <span className="truncate max-w-[120px]">{citation.title}</span>
      {citation.subtitle && (
        <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[80px]">
          ({citation.subtitle})
        </span>
      )}
    </div>
  );
};
