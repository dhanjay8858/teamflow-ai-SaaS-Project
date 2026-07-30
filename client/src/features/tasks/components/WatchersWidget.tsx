import React from 'react';
import { useCollaboration } from '../hooks/useCollaboration';
import { Eye, EyeOff } from 'lucide-react';

interface WatchersWidgetProps {
  taskId: string;
}

export const WatchersWidget: React.FC<WatchersWidgetProps> = ({ taskId }) => {
  const { useTaskWatchers, watchTask, unwatchTask } = useCollaboration();
  const { data } = useTaskWatchers(taskId);

  const isWatching = data?.data?.isWatching || false;
  const watchers = data?.data?.watchers || [];

  const handleToggleWatch = async () => {
    try {
      if (isWatching) {
        await unwatchTask(taskId);
      } else {
        await watchTask(taskId);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update watcher state');
    }
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs">
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleWatch}
          className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
            isWatching
              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          {isWatching ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          <span>{isWatching ? 'Watching' : 'Watch'}</span>
        </button>

        <span className="text-zinc-500 font-medium text-[11px] font-mono">
          {watchers.length} {watchers.length === 1 ? 'watcher' : 'watchers'}
        </span>
      </div>

      {/* Watchers Avatars List */}
      <div className="flex items-center -space-x-1.5 overflow-hidden">
        {watchers.map((w) => (
          <div
            key={w._id}
            title={w.user.name}
            className="h-6 w-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] text-zinc-300 font-bold overflow-hidden"
          >
            {w.user.avatar ? (
              <img src={w.user.avatar} alt={w.user.name} className="h-full w-full object-cover" />
            ) : (
              <span>{w.user.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
