import React from 'react';
import { Task, TaskPriority, TaskStatus } from '../../../types/task';
import { useTaskUiStore } from '../../../stores/taskUi.store';
import { Calendar, Tag, User as UserIcon, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const openDrawer = useTaskUiStore((state) => state.openDrawer);

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-bold';
      case TaskPriority.HIGH:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 font-semibold';
      case TaskPriority.MEDIUM:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case TaskPriority.LOW:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const getStatusDot = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE:
        return 'bg-emerald-400';
      case TaskStatus.IN_PROGRESS:
        return 'bg-indigo-400 animate-pulse';
      case TaskStatus.IN_REVIEW:
        return 'bg-purple-400';
      case TaskStatus.CANCELLED:
        return 'bg-rose-500';
      default:
        return 'bg-zinc-500';
    }
  };

  return (
    <div
      onClick={() => openDrawer(task)}
      className="bg-[#0e0e12] border border-zinc-800/90 hover:border-zinc-700 rounded-xl p-4 shadow-lg transition-all cursor-pointer group space-y-3 relative overflow-hidden"
    >
      {/* Top Header: Task Key & Priority */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${getStatusDot(task.status)}`} />
          <span className="font-mono font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
            {task.taskKey}
          </span>
        </div>

        <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase border ${getPriorityBadge(task.priority)}`}>
          {task.priority === TaskPriority.URGENT && <AlertTriangle className="h-3 w-3 inline mr-1" />}
          {task.priority}
        </span>
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-white group-hover:text-zinc-100 line-clamp-2 leading-snug">
        {task.title}
      </h4>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.labels.map((lbl) => (
            <span
              key={lbl}
              className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-medium flex items-center gap-1"
            >
              <Tag className="h-2.5 w-2.5 text-zinc-500" />
              <span>{lbl}</span>
            </span>
          ))}
        </div>
      )}

      {/* Footer Info: Assignee & Due Date */}
      <div className="pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          {task.assignee ? (
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-full bg-zinc-900 border border-zinc-700 overflow-hidden flex items-center justify-center">
                {task.assignee.avatar ? (
                  <img src={task.assignee.avatar} alt={task.assignee.name} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-3 w-3 text-indigo-400" />
                )}
              </div>
              <span className="text-[11px] text-zinc-400 font-medium truncate max-w-[100px]">
                {task.assignee.name}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-zinc-500 italic">Unassigned</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
              <Calendar className="h-3 w-3 text-purple-400" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          <ArrowUpRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  );
};
