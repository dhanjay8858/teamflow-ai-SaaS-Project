import React from 'react';
import { useCollaboration } from '../hooks/useCollaboration';
import { History, User as UserIcon } from 'lucide-react';

interface TaskHistoryPanelProps {
  taskId: string;
}

export const TaskHistoryPanel: React.FC<TaskHistoryPanelProps> = ({ taskId }) => {
  const { useTaskHistory } = useCollaboration();
  const { data } = useTaskHistory(taskId);
  const history = data?.data?.history || [];

  return (
    <div className="space-y-3 text-xs">
      <h4 className="font-bold text-white flex items-center gap-2">
        <History className="h-4 w-4 text-amber-400" />
        <span>Task Change History ({history.length})</span>
      </h4>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {history.length === 0 ? (
          <p className="text-[11px] text-zinc-500 italic">No historical changes recorded yet.</p>
        ) : (
          history.map((h) => (
            <div key={h._id} className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-amber-400 font-mono">{h.eventType}</span>
                <span className="text-zinc-500">{new Date(h.createdAt).toLocaleTimeString()}</span>
              </div>

              <div className="flex items-center gap-1.5 text-zinc-300">
                <UserIcon className="h-3 w-3 text-zinc-500 shrink-0" />
                <span className="font-semibold text-white">{h.user?.name || 'User'}</span>
                {h.field && <span className="text-zinc-500">changed {h.field}</span>}
                {h.oldValue && h.newValue && (
                  <span className="font-mono text-[10px] text-zinc-400">
                    ({String(h.oldValue)} → {String(h.newValue)})
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
