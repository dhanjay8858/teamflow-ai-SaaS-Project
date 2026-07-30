import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../config/api.client';
import { FileItem, UploadFileParams } from '../../../types/file';
import { AuthApiResponse } from '../../../types/auth';

export const useFiles = () => {
  const queryClient = useQueryClient();

  const useTaskFiles = (taskId?: string) =>
    useQuery<AuthApiResponse<{ files: FileItem[] }>>({
      queryKey: ['task-files', taskId],
      queryFn: async () => {
        if (!taskId) return { success: true, message: '', data: { files: [] } };
        return apiClient.get<unknown, AuthApiResponse<{ files: FileItem[] }>>(`/files/task/${taskId}`);
      },
      enabled: !!taskId,
    });

  const useProjectFiles = (projectId?: string) =>
    useQuery<AuthApiResponse<{ files: FileItem[] }>>({
      queryKey: ['project-files', projectId],
      queryFn: async () => {
        if (!projectId) return { success: true, message: '', data: { files: [] } };
        return apiClient.get<unknown, AuthApiResponse<{ files: FileItem[] }>>(`/files/project/${projectId}`);
      },
      enabled: !!projectId,
    });

  const useWorkspaceFiles = (workspaceId?: string) =>
    useQuery<AuthApiResponse<{ files: FileItem[] }>>({
      queryKey: ['workspace-files', workspaceId],
      queryFn: async () => {
        if (!workspaceId) return { success: true, message: '', data: { files: [] } };
        return apiClient.get<unknown, AuthApiResponse<{ files: FileItem[] }>>(`/files/workspace/${workspaceId}`);
      },
      enabled: !!workspaceId,
    });

  const uploadFileMutation = useMutation<
    AuthApiResponse<{ file: FileItem }>,
    Error,
    { file: File; params: UploadFileParams }
  >({
    mutationFn: async ({ file, params }) => {
      const formData = new FormData();
      formData.append('file', file);

      const queryStr = [
        `workspaceId=${params.workspaceId}`,
        params.projectId ? `projectId=${params.projectId}` : '',
        params.taskId ? `taskId=${params.taskId}` : '',
      ]
        .filter(Boolean)
        .join('&');

      return apiClient.post<unknown, AuthApiResponse<{ file: FileItem }>>(
        `/files/upload?${queryStr}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    },
    onSuccess: (_data, variables) => {
      if (variables.params.taskId) {
        queryClient.invalidateQueries({ queryKey: ['task-files', variables.params.taskId] });
      }
      if (variables.params.projectId) {
        queryClient.invalidateQueries({ queryKey: ['project-files', variables.params.projectId] });
      }
      queryClient.invalidateQueries({ queryKey: ['workspace-files', variables.params.workspaceId] });
    },
  });

  const renameFileMutation = useMutation<
    AuthApiResponse<{ file: FileItem }>,
    Error,
    { fileId: string; displayName: string; taskId?: string; projectId?: string; workspaceId?: string }
  >({
    mutationFn: async ({ fileId, displayName }) =>
      apiClient.patch<unknown, AuthApiResponse<{ file: FileItem }>>(`/files/${fileId}/rename`, { displayName }),
    onSuccess: (_data, variables) => {
      if (variables.taskId) queryClient.invalidateQueries({ queryKey: ['task-files', variables.taskId] });
      if (variables.projectId) queryClient.invalidateQueries({ queryKey: ['project-files', variables.projectId] });
      if (variables.workspaceId) queryClient.invalidateQueries({ queryKey: ['workspace-files', variables.workspaceId] });
    },
  });

  const deleteFileMutation = useMutation<
    AuthApiResponse<null>,
    Error,
    { fileId: string; taskId?: string; projectId?: string; workspaceId?: string }
  >({
    mutationFn: async ({ fileId }) =>
      apiClient.delete<unknown, AuthApiResponse<null>>(`/files/${fileId}`),
    onSuccess: (_data, variables) => {
      if (variables.taskId) queryClient.invalidateQueries({ queryKey: ['task-files', variables.taskId] });
      if (variables.projectId) queryClient.invalidateQueries({ queryKey: ['project-files', variables.projectId] });
      if (variables.workspaceId) queryClient.invalidateQueries({ queryKey: ['workspace-files', variables.workspaceId] });
    },
  });

  const restoreFileMutation = useMutation<
    AuthApiResponse<{ file: FileItem }>,
    Error,
    { fileId: string; taskId?: string; projectId?: string; workspaceId?: string }
  >({
    mutationFn: async ({ fileId }) =>
      apiClient.post<unknown, AuthApiResponse<{ file: FileItem }>>(`/files/${fileId}/restore`, {}),
    onSuccess: (_data, variables) => {
      if (variables.taskId) queryClient.invalidateQueries({ queryKey: ['task-files', variables.taskId] });
      if (variables.projectId) queryClient.invalidateQueries({ queryKey: ['project-files', variables.projectId] });
      if (variables.workspaceId) queryClient.invalidateQueries({ queryKey: ['workspace-files', variables.workspaceId] });
    },
  });

  return {
    useTaskFiles,
    useProjectFiles,
    useWorkspaceFiles,
    uploadFileMutation,
    renameFileMutation,
    deleteFileMutation,
    restoreFileMutation,
  };
};
