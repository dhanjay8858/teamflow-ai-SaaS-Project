import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../config/api.client';
import { TaskWatcher, TaskHistory, RecentlyViewedTask } from '../../../types/task';
import { AuthApiResponse } from '../../../types/auth';

export const useCollaboration = () => {
  const queryClient = useQueryClient();

  // Watchers
  const useTaskWatchers = (taskId?: string) =>
    useQuery<AuthApiResponse<{ isWatching: boolean; watchers: TaskWatcher[] }>>({
      queryKey: ['task-watchers', taskId],
      queryFn: async () => {
        if (!taskId) return { success: true, message: '', data: { isWatching: false, watchers: [] } };
        return apiClient.get<unknown, AuthApiResponse<{ isWatching: boolean; watchers: TaskWatcher[] }>>(
          `/tasks/watch/${taskId}`
        );
      },
      enabled: !!taskId,
    });

  const watchTaskMutation = useMutation<AuthApiResponse<{ watcher: TaskWatcher }>, Error, string>({
    mutationFn: async (taskId) => {
      return apiClient.post('/tasks/watch', { taskId });
    },
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['task-watchers', taskId] });
    },
  });

  const unwatchTaskMutation = useMutation<AuthApiResponse<void>, Error, string>({
    mutationFn: async (taskId) => {
      return apiClient.delete(`/tasks/watch/${taskId}`);
    },
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['task-watchers', taskId] });
    },
  });

  // Task History
  const useTaskHistory = (taskId?: string) =>
    useQuery<AuthApiResponse<{ history: TaskHistory[] }>>({
      queryKey: ['task-history', taskId],
      queryFn: async () => {
        if (!taskId) return { success: true, message: '', data: { history: [] } };
        return apiClient.get<unknown, AuthApiResponse<{ history: TaskHistory[] }>>(`/tasks/history?taskId=${taskId}`);
      },
      enabled: !!taskId,
    });

  // Recently Viewed Tasks
  const useRecentTasks = () =>
    useQuery<AuthApiResponse<{ recentTasks: RecentlyViewedTask[] }>>({
      queryKey: ['recent-tasks'],
      queryFn: async () => {
        return apiClient.get<unknown, AuthApiResponse<{ recentTasks: RecentlyViewedTask[] }>>('/tasks/recent');
      },
    });

  return {
    useTaskWatchers,
    watchTask: watchTaskMutation.mutateAsync,
    unwatchTask: unwatchTaskMutation.mutateAsync,

    useTaskHistory,

    useRecentTasks,
  };
};
