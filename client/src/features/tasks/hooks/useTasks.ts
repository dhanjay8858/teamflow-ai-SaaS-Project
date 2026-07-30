import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../config/api.client';
import { Task, TaskStatus, TaskPriority, CreateTaskPayload, UpdateTaskPayload } from '../../../types/task';
import { AuthApiResponse } from '../../../types/auth';

export const useTasks = () => {
  const queryClient = useQueryClient();

  const useBoardTasks = (boardId?: string, includeArchived = false) => {
    return useQuery<AuthApiResponse<{ tasks: Task[] }>>({
      queryKey: ['board-tasks', boardId, includeArchived],
      queryFn: async () => {
        if (!boardId) return { success: true, message: '', data: { tasks: [] } };
        return apiClient.get<unknown, AuthApiResponse<{ tasks: Task[] }>>(
          `/tasks?boardId=${boardId}&includeArchived=${includeArchived}`
        );
      },
      enabled: !!boardId,
    });
  };

  const useProjectTasks = (projectId?: string, searchQuery?: string) => {
    return useQuery<AuthApiResponse<{ tasks: Task[] }>>({
      queryKey: ['project-tasks', projectId, searchQuery],
      queryFn: async () => {
        if (!projectId) return { success: true, message: '', data: { tasks: [] } };
        const queryParam = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';
        return apiClient.get<unknown, AuthApiResponse<{ tasks: Task[] }>>(
          `/tasks?projectId=${projectId}${queryParam}`
        );
      },
      enabled: !!projectId,
    });
  };

  const useTaskDetails = (taskId?: string) =>
    useQuery<AuthApiResponse<{ task: Task }>>({
      queryKey: ['task-details', taskId],
      queryFn: async () => {
        if (!taskId) throw new Error('Task ID required');
        return apiClient.get<unknown, AuthApiResponse<{ task: Task }>>(`/tasks/${taskId}`);
      },
      enabled: !!taskId,
    });

  const createTaskMutation = useMutation<AuthApiResponse<{ task: Task }>, Error, CreateTaskPayload>({
    mutationFn: async (payload) => {
      return apiClient.post('/tasks', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board-tasks', variables.boardId] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
    },
  });

  const updateTaskMutation = useMutation<
    AuthApiResponse<{ task: Task }>,
    Error,
    { taskId: string; payload: UpdateTaskPayload }
  >({
    mutationFn: async ({ taskId, payload }) => {
      return apiClient.patch(`/tasks/${taskId}`, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-details', variables.taskId] });
    },
  });

  const moveTaskMutation = useMutation<
    AuthApiResponse<{ task: Task }>,
    Error,
    { taskId: string; targetBoardId: string; newPosition?: number; status?: TaskStatus }
  >({
    mutationFn: async (payload) => {
      return apiClient.post('/tasks/move', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
    },
  });

  const assignTaskMutation = useMutation<
    AuthApiResponse<{ task: Task }>,
    Error,
    { taskId: string; assigneeId: string | null }
  >({
    mutationFn: async (payload) => {
      return apiClient.post('/tasks/assign', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-details', variables.taskId] });
    },
  });

  const changeStatusMutation = useMutation<
    AuthApiResponse<{ task: Task }>,
    Error,
    { taskId: string; status: TaskStatus }
  >({
    mutationFn: async (payload) => {
      return apiClient.post('/tasks/status', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-details', variables.taskId] });
    },
  });

  const changePriorityMutation = useMutation<
    AuthApiResponse<{ task: Task }>,
    Error,
    { taskId: string; priority: TaskPriority }
  >({
    mutationFn: async (payload) => {
      return apiClient.post('/tasks/priority', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-details', variables.taskId] });
    },
  });

  const updateLabelsMutation = useMutation<
    AuthApiResponse<{ task: Task }>,
    Error,
    { taskId: string; labels: string[] }
  >({
    mutationFn: async (payload) => {
      return apiClient.post('/tasks/labels', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-details', variables.taskId] });
    },
  });

  const archiveTaskMutation = useMutation<AuthApiResponse<void>, Error, string>({
    mutationFn: async (taskId) => {
      return apiClient.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
    },
  });

  return {
    useBoardTasks,
    useProjectTasks,
    useTaskDetails,

    createTask: createTaskMutation.mutateAsync,
    isCreating: createTaskMutation.isPending,
    createError: createTaskMutation.error,

    updateTask: updateTaskMutation.mutateAsync,
    isUpdating: updateTaskMutation.isPending,

    moveTask: moveTaskMutation.mutateAsync,
    isMoving: moveTaskMutation.isPending,

    assignTask: assignTaskMutation.mutateAsync,
    isAssigning: assignTaskMutation.isPending,

    changeStatus: changeStatusMutation.mutateAsync,
    isChangingStatus: changeStatusMutation.isPending,

    changePriority: changePriorityMutation.mutateAsync,
    isChangingPriority: changePriorityMutation.isPending,

    updateLabels: updateLabelsMutation.mutateAsync,
    isUpdatingLabels: updateLabelsMutation.isPending,

    archiveTask: archiveTaskMutation.mutateAsync,
    isArchiving: archiveTaskMutation.isPending,
  };
};
