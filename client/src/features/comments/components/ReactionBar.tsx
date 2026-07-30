import React, { useMemo } from 'react';
import { CommentReaction, CommentAuthor, ALLOWED_EMOJIS } from '../../../types/comment';
import { useComments } from '../hooks/useComments';

interface ReactionBarProps {
  commentId: string;
  taskId: string;
  reactions: CommentReaction[];
  currentUserId: string;
}

interface ReactionGroup {
  emoji: string;
  count: number;
  users: CommentAuthor[];
  hasReacted: boolean;
}

export const ReactionBar: React.FC<ReactionBarProps> = ({
  commentId,
  taskId,
  reactions,
  currentUserId,
}) => {
  const { addReactionMutation, removeReactionMutation } = useComments(taskId);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const groups = useMemo<ReactionGroup[]>(() => {
    const map = new Map<string, ReactionGroup>();
    for (const r of reactions) {
      const existing = map.get(r.emoji);
      const hasReacted = r.user._id === currentUserId;
      if (existing) {
        existing.count++;
        existing.users.push(r.user);
        if (hasReacted) existing.hasReacted = true;
      } else {
        map.set(r.emoji, { emoji: r.emoji, count: 1, users: [r.user], hasReacted });
      }
    }
    return Array.from(map.values());
  }, [reactions, currentUserId]);

  const handleToggle = async (emoji: string, hasReacted: boolean) => {
    try {
      if (hasReacted) {
        await removeReactionMutation.mutateAsync({ commentId, emoji });
      } else {
        await addReactionMutation.mutateAsync({ commentId, emoji });
      }
    } catch {
      // errors are handled upstream
    }
  };

  const handlePickerSelect = async (emoji: string) => {
    setPickerOpen(false);
    const group = groups.find((g) => g.emoji === emoji);
    if (group?.hasReacted) return;
    try {
      await addReactionMutation.mutateAsync({ commentId, emoji });
    } catch {
      // silently ignore
    }
  };

  return (
    <div className="flex items-center gap-1 flex-wrap mt-1.5 relative">
      {/* Existing reaction pills */}
      {groups.map((group) => (
        <button
          key={group.emoji}
          title={group.users.map((u) => u.name).join(', ')}
          onClick={() => handleToggle(group.emoji, group.hasReacted)}
          className={`
            inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border
            transition-all duration-150 select-none
            ${
              group.hasReacted
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
            }
          `}
          aria-pressed={group.hasReacted}
          aria-label={`${group.emoji} reaction, ${group.count} people`}
        >
          <span>{group.emoji}</span>
          <span className="font-mono">{group.count}</span>
        </button>
      ))}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setPickerOpen((v) => !v)}
          className="inline-flex items-center justify-center h-6 w-6 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 text-sm transition-colors"
          aria-label="Add reaction"
          aria-expanded={pickerOpen}
        >
          +
        </button>

        {pickerOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setPickerOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute bottom-8 left-0 z-20 p-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl grid grid-cols-5 gap-1 min-w-[180px]">
              {ALLOWED_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handlePickerSelect(emoji)}
                  className="text-lg p-1.5 rounded-lg hover:bg-zinc-800 transition-colors leading-none"
                  aria-label={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
