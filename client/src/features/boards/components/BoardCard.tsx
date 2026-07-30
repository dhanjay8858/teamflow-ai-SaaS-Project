import React from 'react';
import { Board } from '../../../types/board';
import { Kanban, ChevronLeft, ChevronRight, Edit2, Archive, Star } from 'lucide-react';

interface BoardCardProps {
  board: Board;
  isFirst: boolean;
  isLast: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onEdit: (board: Board) => void;
  onArchive: (board: Board) => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({
  board,
  isFirst,
  isLast,
  onMoveLeft,
  onMoveRight,
  onEdit,
  onArchive,
}) => {
  return (
    <div className="w-80 bg-[#0e0e12] border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between shrink-0 space-y-4 relative group overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: board.color || '#6366f1' }} />

      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: `${board.color || '#6366f1'}25`, color: board.color || '#6366f1' }}
            >
              <Kanban className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                <span>{board.name}</span>
                {board.isDefault && <Star className="h-3 w-3 text-amber-400 fill-amber-400" />}
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono">/{board.slug}</p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400">
            Col #{board.position}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-400 line-clamp-2 min-h-[32px]">
          {board.description || 'No board column description specified.'}
        </p>
      </div>

      {/* Column Footer Controls */}
      <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
        {/* Move Left / Right Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveLeft}
            disabled={isFirst}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Move Column Left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onMoveRight}
            disabled={isLast}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Move Column Right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(board)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
            title="Edit Board Settings"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          {!board.isDefault && (
            <button
              onClick={() => onArchive(board)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Archive Board"
            >
              <Archive className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
