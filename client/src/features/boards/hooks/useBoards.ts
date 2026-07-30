import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../config/api.client';
import { Board, CreateBoardPayload, UpdateBoardPayload, ReorderBoardItem } from '../../../types/board';
import { AuthApiResponse } from '../../../types/auth';

export const useBoards = () => {
  const queryClient = useQueryClient();

  const useProjectBoards = (projectId?: string, includeArchived = false) => {
    return useQuery<AuthApiResponse<{ boards: Board[] }>>({
      queryKey: ['project-boards', projectId, includeArchived],
      queryFn: async () => {
        if (!projectId) return { success: true, message: '', data: { boards: [] } };
        return apiClient.get<unknown, AuthApiResponse<{ boards: Board[] }>>(
          `/boards?projectId=${projectId}&includeArchived=${includeArchived}`
        );
      },
      enabled: !!projectId,
    });
  };

  const useBoardDetails = (boardId?: string) =>
    useQuery<AuthApiResponse<{ board: Board }>>({
      queryKey: ['board-details', boardId],
      queryFn: async () => {
        if (!boardId) throw new Error('Board ID required');
        return apiClient.get<unknown, AuthApiResponse<{ board: Board }>>(`/boards/${boardId}`);
      },
      enabled: !!boardId,
    });

  const createBoardMutation = useMutation<AuthApiResponse<{ board: Board }>, Error, CreateBoardPayload>({
    mutationFn: async (payload) => {
      return apiClient.post('/boards', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-boards', variables.projectId] });
    },
  });

  const updateBoardMutation = useMutation<
    AuthApiResponse<{ board: Board }>,
    Error,
    { boardId: string; projectId: string; payload: UpdateBoardPayload }
  >({
    mutationFn: async ({ boardId, payload }) => {
      return apiClient.patch(`/boards/${boardId}`, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-boards', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['board-details', variables.boardId] });
    },
  });

  const archiveBoardMutation = useMutation<AuthApiResponse<void>, Error, { boardId: string; projectId: string }>({
    mutationFn: async ({ boardId }) => {
      return apiClient.delete(`/boards/${boardId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-boards', variables.projectId] });
    },
  });

  const reorderBoardsMutation = useMutation<
    AuthApiResponse<void>,
    Error,
    { projectId: string; boards: ReorderBoardItem[] }
  >({
    mutationFn: async (payload) => {
      return apiClient.post('/boards/reorder', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-boards', variables.projectId] });
    },
  });

  return {
    useProjectBoards,
    useBoardDetails,

    createBoard: createBoardMutation.mutateAsync,
    isCreating: createBoardMutation.isPending,
    createError: createBoardMutation.error,

    updateBoard: updateBoardMutation.mutateAsync,
    isUpdating: updateBoardMutation.isPending,

    archiveBoard: archiveBoardMutation.mutateAsync,
    isArchiving: archiveBoardMutation.isPending,

    reorderBoards: reorderBoardsMutation.mutateAsync,
    isReordering: reorderBoardsMutation.isPending,
  };
};
