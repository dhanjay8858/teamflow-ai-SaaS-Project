import React, { useState } from 'react';
import { useRichTasks } from '../hooks/useRichTasks';
import { useTasks } from '../hooks/useTasks';
import { Link2, Plus, Trash2, ShieldAlert } from 'lucide-react';

interface DependenciesWidgetProps {
  taskId: string;
  projectId: string;
}

export const DependenciesWidget: React.FC<DependenciesWidgetProps> = ({ taskId, projectId }) => {
  const { useTaskDependencies, createDependency, deleteDependency } = useRichTasks();
  const { useProjectTasks } = useTasks();

  const { data: depsData } = useTaskDependencies(taskId);
  const dependencies = depsData?.data?.dependencies || [];

  const { data: projectTasksData } = useProjectTasks(projectId);
  const allProjectTasks = projectTasksData?.data?.tasks || [];

  const [selectedDependsOnId, setSelectedDependsOnId] = useState('');

  // Available tasks to depend on (exclude self & existing dependencies)
  const availableTasks = allProjectTasks.filter(
    (t) => t._id !== taskId && !dependencies.some((d) => (d.dependsOn?._id || d.dependsOn) === t._id)
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDependsOnId) return;

    try {
      await createDependency({ taskId, dependsOnId: selectedDependsOnId });
      setSelectedDependsOnId('');
    } catch (err: any) {
      alert(err.message || 'Failed to add dependency');
    }
  };

  const handleDelete = async (depId: string) => {
    try {
      await deleteDependency({ depId, taskId });
    } catch (err: any) {
      alert(err.message || 'Failed to remove dependency');
    }
  };

  return (
    <div className="space-y-3 text-xs">
      <h4 className="font-bold text-white flex items-center gap-2">
        <Link2 className="h-4 w-4 text-purple-400" />
        <span>Dependencies ({dependencies.length})</span>
      </h4>

      {/* Dependency List */}
      <div className="space-y-1.5">
        {dependencies.map((dep) => (
          <div
            key={dep._id}
            className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80 group hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="font-mono text-indigo-400 font-bold">{dep.dependsOn?.taskKey}</span>
              <span className="truncate text-zinc-300">{dep.dependsOn?.title}</span>
            </div>

            <button
              onClick={() => handleDelete(dep._id)}
              className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Dependency Dropdown Form */}
      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <select
          value={selectedDependsOnId}
          onChange={(e) => setSelectedDependsOnId(e.target.value)}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="">Select task this task depends on...</option>
          {availableTasks.map((t) => (
            <option key={t._id} value={t._id}>
              {t.taskKey} — {t.title}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!selectedDependsOnId}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-purple-400 border border-zinc-800 font-medium flex items-center gap-1 disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
};
