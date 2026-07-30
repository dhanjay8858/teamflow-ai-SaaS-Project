import React, { useState } from 'react';
import { CornerDownRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Comment, CommentReaction } from '../../../types/comment';
import { useComments } from '../hooks/useComments';
import { CommentCard } from './CommentCard';
import { CommentComposer } from './CommentComposer';

interface ReplyThreadProps {
  parentCommentId: string;
  taskId: string;
  replies: Comment[];
  reactions: CommentReaction[];
  currentUserId: string;
  replyCount: number;
}

export const ReplyThread: React.FC<ReplyThreadProps> = ({
  parentCommentId,
  taskId,
  replies,
  reactions,
  currentUserId,
  replyCount,
}) => {
  const { createReplyMutation } = useComments(taskId);
  const [expanded, setExpanded] = useState(replyCount > 0 && replyCount <= 3);
  const [showComposer, setShowComposer] = useState(false);

  const handleReply = async (markdown: string) => {
    await createReplyMutation.mutateAsync({ parentCommentId, taskId, markdown });
    setShowComposer(false);
  };

  const reactionsByComment = (commentId: string) =>
    reactions.filter((r) => r.comment === commentId);

  return (
    <div className="mt-2 ml-8 border-l-2 border-zinc-800/60 pl-3 space-y-2">
      {/* Show/hide replies toggle */}
      {replyCount > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-indigo-400 transition-colors"
        >
          <CornerDownRight size={12} />
          <span>
            {expanded ? 'Hide' : 'Show'} {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
          </span>
          {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
      )}

      {/* Replies list */}
      {expanded && (
        <div className="space-y-2">
          {replies.map((reply) => (
            <CommentCard
              key={reply._id}
              comment={reply}
              taskId={taskId}
              reactions={reactionsByComment(reply._id)}
              currentUserId={currentUserId}
              isReply
            />
          ))}
        </div>
      )}

      {/* Reply composer trigger */}
      {!showComposer ? (
        <button
          onClick={() => { setShowComposer(true); setExpanded(true); }}
          className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-indigo-400 transition-colors"
        >
          <CornerDownRight size={12} />
          <span>Write a reply…</span>
        </button>
      ) : (
        <div className="space-y-1.5">
          <CommentComposer
            taskId={taskId}
            onSubmit={handleReply}
            placeholder="Write a reply… (Markdown supported)"
            autoFocus
            compact
          />
          <button
            onClick={() => setShowComposer(false)}
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
