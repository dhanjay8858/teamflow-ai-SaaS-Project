import React from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useComments } from '../hooks/useComments';
import { useAuthStore } from '../../../stores/auth.store';
import { CommentCard } from './CommentCard';
import { CommentComposer } from './CommentComposer';
import { ReplyThread } from './ReplyThread';

interface CommentsPanelProps {
  taskId: string;
}

export const CommentsPanel: React.FC<CommentsPanelProps> = ({ taskId }) => {
  const { user } = useAuthStore();
  const {
    commentsQuery,
    createCommentMutation,
  } = useComments(taskId);

  const data = commentsQuery.data?.data;
  const comments = data?.comments ?? [];
  const repliesMap = data?.replies ?? {};
  const reactions = data?.reactions ?? [];
  const total = data?.total ?? 0;

  const currentUserId = user?.id ?? '';

  const reactionsByComment = (commentId: string) =>
    reactions.filter((r) => r.comment === commentId);

  const handleCreateComment = async (markdown: string) => {
    await createCommentMutation.mutateAsync({ taskId, markdown });
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-zinc-400" />
        <span className="text-xs font-bold text-white">Comments</span>
        {total > 0 && (
          <span className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-zinc-800 text-[10px] font-mono text-zinc-400">
            {total}
          </span>
        )}
      </div>

      {/* Composer */}
      <CommentComposer
        taskId={taskId}
        onSubmit={handleCreateComment}
        disabled={createCommentMutation.isPending}
      />

      {/* Comments list */}
      {commentsQuery.isLoading ? (
        <div className="flex items-center gap-2 text-xs text-zinc-500 py-3">
          <Loader2 size={14} className="animate-spin" />
          <span>Loading comments…</span>
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-zinc-600 text-xs gap-2">
          <MessageSquare size={28} className="text-zinc-800" />
          <span>No comments yet. Be the first to comment.</span>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const commentReplies = repliesMap[comment._id] ?? [];

            return (
              <div key={comment._id} className="space-y-1">
                <CommentCard
                  comment={comment}
                  taskId={taskId}
                  reactions={reactionsByComment(comment._id)}
                  currentUserId={currentUserId}
                />
                {/* Reply thread (only for top-level comments) */}
                {!comment.parentComment && (
                  <ReplyThread
                    parentCommentId={comment._id}
                    taskId={taskId}
                    replies={commentReplies}
                    reactions={reactions}
                    currentUserId={currentUserId}
                    replyCount={comment.replyCount}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
