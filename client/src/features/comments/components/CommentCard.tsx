import React, { useState } from 'react';
import { Edit2, Trash2, RefreshCw, Clock } from 'lucide-react';
import { Comment, CommentReaction } from '../../../types/comment';
import { useComments } from '../hooks/useComments';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ReactionBar } from './ReactionBar';

interface CommentCardProps {
  comment: Comment;
  taskId: string;
  reactions: CommentReaction[];
  currentUserId: string;
  isReply?: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const CommentCard: React.FC<CommentCardProps> = ({
  comment,
  taskId,
  reactions,
  currentUserId,
  isReply = false,
}) => {
  const { updateCommentMutation, deleteCommentMutation, restoreCommentMutation } = useComments(taskId);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.markdown);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const isDeleted = !!comment.deletedAt;
  const isAuthor = comment.author._id === currentUserId;

  const handleEdit = async () => {
    if (!editText.trim() || editSubmitting) return;
    setEditSubmitting(true);
    try {
      await updateCommentMutation.mutateAsync({ commentId: comment._id, markdown: editText.trim() });
      setIsEditing(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update comment');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteCommentMutation.mutateAsync({ commentId: comment._id });
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleRestore = async () => {
    try {
      await restoreCommentMutation.mutateAsync({
        commentId: comment._id,
        originalMarkdown: comment.markdown,
      });
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to restore comment');
    }
  };

  return (
    <div className={`group flex gap-2.5 ${isReply ? 'pl-0' : ''}`} id={`comment-${comment._id}`}>
      {/* Avatar */}
      <div className="shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold select-none">
        {comment.author.avatar ? (
          <img
            src={comment.author.avatar}
            alt={comment.author.name}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          getInitials(comment.author.name)
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-zinc-200">{comment.author.name}</span>
          <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-0.5">
            <Clock size={9} />
            {timeAgo(comment.createdAt)}
          </span>
          {comment.isEdited && !isDeleted && (
            <span className="text-[10px] text-zinc-600 italic">(edited)</span>
          )}
        </div>

        {/* Body */}
        {isEditing ? (
          <div className="space-y-1.5">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={4}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono resize-none outline-none focus:border-indigo-500"
              autoFocus
              aria-label="Edit comment"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                disabled={editSubmitting || !editText.trim()}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs rounded-lg font-medium"
              >
                {editSubmitting ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => { setIsEditing(false); setEditText(comment.markdown); }}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-xl px-3 py-2 text-xs leading-relaxed
              ${isDeleted
                ? 'bg-zinc-900/40 border border-zinc-800/50'
                : 'bg-zinc-900/80 border border-zinc-800/60'
              }
            `}
          >
            <MarkdownRenderer markdown={comment.markdown} />
          </div>
        )}

        {/* Reactions */}
        {!isDeleted && !isEditing && (
          <ReactionBar
            commentId={comment._id}
            taskId={taskId}
            reactions={reactions}
            currentUserId={currentUserId}
          />
        )}

        {/* Actions row (hover revealed) */}
        {!isEditing && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {isAuthor && !isDeleted && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors"
                aria-label="Edit comment"
              >
                <Edit2 size={10} />
                <span>Edit</span>
              </button>
            )}
            {(isAuthor || !isDeleted) && !isDeleted && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1 text-[10px] text-zinc-600 hover:text-rose-400 transition-colors"
                aria-label="Delete comment"
              >
                <Trash2 size={10} />
                <span>Delete</span>
              </button>
            )}
            {isDeleted && isAuthor && (
              <button
                onClick={handleRestore}
                className="inline-flex items-center gap-1 text-[10px] text-zinc-600 hover:text-emerald-400 transition-colors"
                aria-label="Restore comment"
              >
                <RefreshCw size={10} />
                <span>Restore</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
