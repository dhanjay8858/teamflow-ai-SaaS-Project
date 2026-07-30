import React from 'react';
import { useCollaboration } from '../hooks/useCollaboration';
import { useTaskUiStore } from '../../../stores/taskUi.store';
import { Clock } from 'lucide-react';

export const RecentlyViewedWidget: React.FC = () => {
  const openDrawer = useTaskUiStore((state) => state.openDrawer);
  const { useRecentTasks } = useCollaboration();
  const { data } = useRecentTasks();
  const recentTasks = data?.data?.recentTasks || [];

  if (recentTasks.length === 0) return null;

  return (
    <div className="p-3.5 rounded-2xl bg-[#0e0e12] border border-zinc-800/80 space-y-2 text-xs">
      <div className="flex items-center gap-2 text-zinc-400 font-bold">
        <Clock className="h-3.5 w-3.5 text-indigo-400" />
        <span>Recently Viewed Tasks</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {recentTasks.slice(0, 8).map((rv) => {
          if (!rv.task) return null;
          return (
            <button
              key={rv._id}
              onClick={() => openDrawer(rv.task)}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 flex items-center gap-2 text-left shrink-0 transition-colors"
            >
              <span className="font-mono text-indigo-400 font-bold text-[11px]">{rv.task.taskKey}</span>
              <span className="text-zinc-300 max-w-[120px] truncate">{rv.task.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
