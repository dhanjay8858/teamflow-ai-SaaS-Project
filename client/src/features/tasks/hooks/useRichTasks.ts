import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../config/api.client';
import { ChecklistItem, TaskDependency, Task } from '../../../types/task';
import { AuthApiResponse } from '../../../types/auth';

export const useRichTasks = () => {
  const queryClient = useQueryClient();

  // Checklist
  const useTaskChecklist = (taskId?: string) =>
    useQuery<AuthApiResponse<{ items: ChecklistItem[] }>>({
      queryKey: ['task-checklist', taskId],
      queryFn: async () => {
        if (!taskId) return { success: true, message: '', data: { items: [] } };
        return apiClient.get<unknown, AuthApiResponse<{ items: ChecklistItem[] }>>(`/tasks/checklist?taskId=${taskId}`);
      },
      enabled: !!taskId,
    });

  const createChecklistItemMutation = useMutation<
    AuthApiResponse<{ item: ChecklistItem }>,
    Error,
    { taskId: string; text: string }
  >({
    mutationFn: async (payload) => {
      return apiClient.post('/tasks/checklist', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task-checklist', variables.taskId] });
    },
  });

  const updateChecklistItemMutation = useMutation<
    AuthApiResponse<{ item: ChecklistItem }>,
    Error,
    { itemId: string; taskId: string; text?: string; completed?: boolean }
  >({
    mutationFn: async ({ itemId, text, completed }) => {
      return apiClient.patch(`/tasks/checklist/${itemId}`, { text, completed });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task-checklist', variables.taskId] });
    },
  });

  const deleteChecklistItemMutation = useMutation<
    AuthApiResponse<void>,
    Error,
    { itemId: string; taskId: string }
  >({
    mutationFn: async ({ itemId }) => {
      return apiClient.delete(`/tasks/checklist/${itemId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task-checklist', variables.taskId] });
    },
  });

  // Dependencies
  const useTaskDependencies = (taskId?: string) =>
    useQuery<AuthApiResponse<{ dependencies: TaskDependency[] }>>({
      queryKey: ['task-dependencies', taskId],
      queryFn: async () => {
        if (!taskId) return { success: true, message: '', data: { dependencies: [] } };
        return apiClient.get<unknown, AuthApiResponse<{ dependencies: TaskDependency[] }>>(
          `/tasks/dependencies?taskId=${taskId}`
        );
      },
      enabled: !!taskId,
    });

  const createDependencyMutation = useMutation<
    AuthApiResponse<{ dependency: TaskDependency }>,
    Error,
    { taskId: string; dependsOnId: string }
  >({
    mutationFn: async (payload) => {
      return apiClient.post('/tasks/dependencies', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['task-details', variables.taskId] });
    },
  });

  const deleteDependencyMutation = useMutation<
    AuthApiResponse<void>,
    Error,
    { depId: string; taskId: string }
  >({
    mutationFn: async ({ depId }) => {
      return apiClient.delete(`/tasks/dependencies/${depId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['task-details', variables.taskId] });
    },
  });

  // Time Tracking
  const updateTimeTrackingMutation = useMutation<
    AuthApiResponse<{ task: Task }>,
    Error,
    { taskId: string; estimateMinutes?: number; spentMinutes?: number }
  >({
    mutationFn: async (payload) => {
      return apiClient.post('/tasks/time', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task-details', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['board-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] });
    },
  });

  return {
    useTaskChecklist,
    createChecklistItem: createChecklistItemMutation.mutateAsync,
    updateChecklistItem: updateChecklistItemMutation.mutateAsync,
    deleteChecklistItem: deleteChecklistItemMutation.mutateAsync,

    useTaskDependencies,
    createDependency: createDependencyMutation.mutateAsync,
    deleteDependency: deleteDependencyMutation.mutateAsync,

    updateTimeTracking: updateTimeTrackingMutation.mutateAsync,
    isUpdatingTime: updateTimeTrackingMutation.isPending,
  };
};
