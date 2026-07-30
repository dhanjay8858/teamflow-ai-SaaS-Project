import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../config/api.client';
import {
  TaskCommentsResult,
  Comment,
  CommentReaction,
  CreateCommentPayload,
  CreateReplyPayload,
  UpdateCommentPayload,
} from '../../../types/comment';
import { AuthApiResponse } from '../../../types/auth';

const COMMENTS_KEY = (taskId: string) => ['task-comments', taskId];

export const useComments = (taskId?: string) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    if (taskId) queryClient.invalidateQueries({ queryKey: COMMENTS_KEY(taskId) });
  };

  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  const commentsQuery = useQuery<AuthApiResponse<TaskCommentsResult>>({
    queryKey: COMMENTS_KEY(taskId ?? ''),
    queryFn: async () => {
      if (!taskId) return { success: true, message: '', data: { comments: [], total: 0, replies: {}, reactions: [] } };
      return apiClient.get<unknown, AuthApiResponse<TaskCommentsResult>>(`/comments/task/${taskId}`);
    },
    enabled: !!taskId,
    staleTime: 30_000,
  });

  // -------------------------------------------------------------------------
  // Mutations
  // -------------------------------------------------------------------------

  const createCommentMutation = useMutation<
    AuthApiResponse<{ comment: Comment }>,
    Error,
    CreateCommentPayload
  >({
    mutationFn: (payload) =>
      apiClient.post<unknown, AuthApiResponse<{ comment: Comment }>>('/comments', payload),
    onSuccess: invalidate,
  });

  const createReplyMutation = useMutation<
    AuthApiResponse<{ comment: Comment }>,
    Error,
    { parentCommentId: string } & CreateReplyPayload
  >({
    mutationFn: ({ parentCommentId, ...payload }) =>
      apiClient.post<unknown, AuthApiResponse<{ comment: Comment }>>(
        `/comments/${parentCommentId}/reply`,
        payload
      ),
    onSuccess: invalidate,
  });

  const updateCommentMutation = useMutation<
    AuthApiResponse<{ comment: Comment }>,
    Error,
    { commentId: string } & UpdateCommentPayload
  >({
    mutationFn: ({ commentId, ...payload }) =>
      apiClient.patch<unknown, AuthApiResponse<{ comment: Comment }>>(`/comments/${commentId}`, payload),
    onSuccess: invalidate,
  });

  const deleteCommentMutation = useMutation<
    AuthApiResponse<null>,
    Error,
    { commentId: string }
  >({
    mutationFn: ({ commentId }) =>
      apiClient.delete<unknown, AuthApiResponse<null>>(`/comments/${commentId}`),
    onSuccess: invalidate,
  });

  const restoreCommentMutation = useMutation<
    AuthApiResponse<{ comment: Comment }>,
    Error,
    { commentId: string; originalMarkdown: string }
  >({
    mutationFn: ({ commentId, originalMarkdown }) =>
      apiClient.post<unknown, AuthApiResponse<{ comment: Comment }>>(
        `/comments/${commentId}/restore`,
        { originalMarkdown }
      ),
    onSuccess: invalidate,
  });

  const addReactionMutation = useMutation<
    AuthApiResponse<{ reaction: CommentReaction }>,
    Error,
    { commentId: string; emoji: string }
  >({
    mutationFn: ({ commentId, emoji }) =>
      apiClient.post<unknown, AuthApiResponse<{ reaction: CommentReaction }>>(
        `/comments/${commentId}/reactions`,
        { emoji }
      ),
    onSuccess: invalidate,
  });

  const removeReactionMutation = useMutation<
    AuthApiResponse<null>,
    Error,
    { commentId: string; emoji: string }
  >({
    mutationFn: ({ commentId, emoji }) =>
      apiClient.delete<unknown, AuthApiResponse<null>>(`/comments/${commentId}/reactions`, {
        data: { emoji },
      }),
    onSuccess: invalidate,
  });

  return {
    commentsQuery,
    createCommentMutation,
    createReplyMutation,
    updateCommentMutation,
    deleteCommentMutation,
    restoreCommentMutation,
    addReactionMutation,
    removeReactionMutation,
  };
};
