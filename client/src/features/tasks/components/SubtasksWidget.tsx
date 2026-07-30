import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useTaskUiStore } from '../../../stores/taskUi.store';
import { ListTree, Plus, ArrowRight } from 'lucide-react';

interface SubtasksWidgetProps {
  parentTaskId: string;
  projectId: string;
  boardId: string;
}

export const SubtasksWidget: React.FC<SubtasksWidgetProps> = ({ parentTaskId, projectId, boardId }) => {
  const openDrawer = useTaskUiStore((state) => state.openDrawer);
  const { useProjectTasks, createTask } = useTasks();
  const { data } = useProjectTasks(projectId);

  const allTasks = data?.data?.tasks || [];
  const subtasks = allTasks.filter((t) => (t.parentTask as any) === parentTaskId || (t.parentTask as any)?._id === parentTaskId);

  const [title, setTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleCreateSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createTask({
        boardId,
        title: title.trim(),
        parentTaskId,
      });
      setTitle('');
      setIsAdding(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create subtask');
    }
  };

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-white flex items-center gap-2">
          <ListTree className="h-4 w-4 text-indigo-400" />
          <span>Subtasks ({subtasks.length})</span>
        </h4>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> Add Subtask
        </button>
      </div>

      {/* Subtasks List */}
      <div className="space-y-1.5">
        {subtasks.map((st) => (
          <div
            key={st._id}
            onClick={() => openDrawer(st)}
            className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer group transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="font-mono text-indigo-400 font-bold">{st.taskKey}</span>
              <span className="truncate text-zinc-300">{st.title}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400">
                {st.status}
              </span>
              <ArrowRight className="h-3 w-3 text-zinc-600 group-hover:text-white transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* Inline Create Subtask Form */}
      {isAdding && (
        <form onSubmit={handleCreateSubtask} className="flex items-center gap-2">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Subtask title..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
          >
            Create
          </button>
        </form>
      )}
    </div>
  );
};
