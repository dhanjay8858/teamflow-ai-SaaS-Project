import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../config/api.client';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { useOrganizationStore } from '../../../stores/organization.store';
import { Workspace, CreateWorkspacePayload } from '../../../types/organization';
import { AuthApiResponse } from '../../../types/auth';

export const useWorkspaces = () => {
  const queryClient = useQueryClient();
  const setWorkspaces = useWorkspaceStore((state) => state.setWorkspaces);
  const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const currentOrganization = useOrganizationStore((state) => state.currentOrganization);

  const useOrgWorkspaces = (orgId?: string) => {
    const targetOrgId = orgId || currentOrganization?._id;
    return useQuery<AuthApiResponse<{ workspaces: Workspace[] }>>({
      queryKey: ['org-workspaces', targetOrgId],
      queryFn: async () => {
        if (!targetOrgId) return { success: true, message: '', data: { workspaces: [] } };
        const response = await apiClient.get<unknown, AuthApiResponse<{ workspaces: Workspace[] }>>(
          `/workspaces?organizationId=${targetOrgId}`
        );
        if (response?.data?.workspaces) {
          setWorkspaces(response.data.workspaces);
          if (!currentWorkspace && response.data.workspaces.length > 0) {
            const defaultWs = response.data.workspaces.find((w) => w.isDefault) || response.data.workspaces[0];
            setCurrentWorkspace(defaultWs);
          }
        }
        return response;
      },
      enabled: !!targetOrgId,
    });
  };

  const createWorkspaceMutation = useMutation<
    AuthApiResponse<{ workspace: Workspace }>,
    Error,
    CreateWorkspacePayload
  >({
    mutationFn: async (payload) => {
      return apiClient.post('/workspaces', payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['org-workspaces'] });
      if (data?.data?.workspace) {
        setCurrentWorkspace(data.data.workspace);
      }
    },
  });

  const updateWorkspaceMutation = useMutation<
    AuthApiResponse<{ workspace: Workspace }>,
    Error,
    { id: string; name?: string; description?: string }
  >({
    mutationFn: async ({ id, ...payload }) => {
      return apiClient.patch(`/workspaces/${id}`, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['org-workspaces'] });
      if (data?.data?.workspace) {
        setCurrentWorkspace(data.data.workspace);
      }
    },
  });

  const archiveWorkspaceMutation = useMutation<AuthApiResponse<void>, Error, string>({
    mutationFn: async (id) => {
      return apiClient.delete(`/workspaces/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-workspaces'] });
      setCurrentWorkspace(null);
    },
  });

  return {
    useOrgWorkspaces,
    createWorkspace: createWorkspaceMutation.mutateAsync,
    isCreatingWorkspace: createWorkspaceMutation.isPending,
    createWorkspaceError: createWorkspaceMutation.error,

    updateWorkspace: updateWorkspaceMutation.mutateAsync,
    isUpdatingWorkspace: updateWorkspaceMutation.isPending,

    archiveWorkspace: archiveWorkspaceMutation.mutateAsync,
    isArchivingWorkspace: archiveWorkspaceMutation.isPending,
  };
};
