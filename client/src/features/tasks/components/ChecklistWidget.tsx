import React, { useState } from 'react';
import { useRichTasks } from '../hooks/useRichTasks';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';

interface ChecklistWidgetProps {
  taskId: string;
}

export const ChecklistWidget: React.FC<ChecklistWidgetProps> = ({ taskId }) => {
  const { useTaskChecklist, createChecklistItem, updateChecklistItem, deleteChecklistItem } = useRichTasks();
  const { data } = useTaskChecklist(taskId);
  const items = data?.data?.items || [];

  const [newItemText, setNewItemText] = useState('');

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    try {
      await createChecklistItem({ taskId, text: newItemText.trim() });
      setNewItemText('');
    } catch (err: any) {
      alert(err.message || 'Failed to add item');
    }
  };

  const handleToggle = async (itemId: string, currentCompleted: boolean) => {
    try {
      await updateChecklistItem({ itemId, taskId, completed: !currentCompleted });
    } catch (err: any) {
      alert(err.message || 'Failed to update item');
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await deleteChecklistItem({ itemId, taskId });
    } catch (err: any) {
      alert(err.message || 'Failed to delete item');
    }
  };

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-white flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-emerald-400" />
          <span>Checklist ({completedCount}/{items.length})</span>
        </h4>
        <span className="font-mono text-zinc-400 font-semibold">{progressPercent}%</span>
      </div>

      {/* Progress Bar */}
      {items.length > 0 && (
        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Checklist Items */}
      <div className="space-y-1.5">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80 group hover:border-zinc-700 transition-colors"
          >
            <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => handleToggle(item._id, item.completed)}
                className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-0 cursor-pointer"
              />
              <span className={`truncate text-xs ${item.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                {item.text}
              </span>
            </label>

            <button
              onClick={() => handleDelete(item._id)}
              className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Item Form */}
      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add an item..."
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-emerald-400 border border-zinc-800 font-medium flex items-center gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
};
