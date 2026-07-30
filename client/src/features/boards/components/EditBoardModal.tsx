import React, { useState, useEffect } from 'react';
import { useBoards } from '../hooks/useBoards';
import { Board } from '../../../types/board';
import { X, Kanban, RefreshCw } from 'lucide-react';

interface EditBoardModalProps {
  isOpen: boolean;
  board: Board | null;
  projectId: string;
  onClose: () => void;
}

const COLOR_OPTIONS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#3b82f6'];

export const EditBoardModal: React.FC<EditBoardModalProps> = ({ isOpen, board, projectId, onClose }) => {
  const { updateBoard, isUpdating } = useBoards();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  useEffect(() => {
    if (board) {
      setName(board.name);
      setDescription(board.description || '');
      setColor(board.color || COLOR_OPTIONS[0]);
    }
  }, [board]);

  if (!isOpen || !board) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateBoard({
        boardId: board._id,
        projectId,
        payload: {
          name: name.trim(),
          description: description.trim(),
          color,
        },
      });
      onClose();
    } catch {
      // Handled in hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0e0e12] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 relative">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Kanban className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Edit Board Settings</h3>
              <p className="text-xs text-zinc-400 font-mono">/{board.slug}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-medium text-zinc-300">Board Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-zinc-300">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-medium text-zinc-300">Column Accent Color</label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-lg border transition-all ${
                    color === c ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isUpdating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
