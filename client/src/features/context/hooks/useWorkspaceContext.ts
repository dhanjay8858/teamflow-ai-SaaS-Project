import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../config/api.client';
import { useOrganizationStore } from '../../../stores/organization.store';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { Organization, Workspace, Membership } from '../../../types/organization';
import { AuthApiResponse } from '../../../types/auth';

export interface WorkspaceContextResponseData {
  organization: Organization;
  workspace: Workspace;
  membership: Membership;
}

export const useWorkspaceContext = () => {
  const queryClient = useQueryClient();
  const setCurrentOrganization = useOrganizationStore((state) => state.setCurrentOrganization);
  const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);

  const useGetContext = () =>
    useQuery<AuthApiResponse<WorkspaceContextResponseData>>({
      queryKey: ['workspace-context'],
      queryFn: async () => {
        const response = await apiClient.get<unknown, AuthApiResponse<WorkspaceContextResponseData>>('/context');
        if (response?.data?.organization && response?.data?.workspace) {
          setCurrentOrganization(response.data.organization);
          setCurrentWorkspace(response.data.workspace);
        }
        return response;
      },
      staleTime: 10 * 60 * 1000,
    });

  const switchContextMutation = useMutation<
    AuthApiResponse<WorkspaceContextResponseData>,
    Error,
    { organizationSlug: string; workspaceSlug: string }
  >({
    mutationFn: async (payload) => {
      return apiClient.post('/context/switch', payload);
    },
    onSuccess: (data) => {
      if (data?.data?.organization && data?.data?.workspace) {
        setCurrentOrganization(data.data.organization);
        setCurrentWorkspace(data.data.workspace);

        // Targeted cache invalidation
        queryClient.invalidateQueries({ queryKey: ['workspace-context'] });
        queryClient.invalidateQueries({ queryKey: ['org-workspaces'] });
        queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
      }
    },
  });

  return {
    useGetContext,
    switchWorkspaceContext: switchContextMutation.mutateAsync,
    isSwitching: switchContextMutation.isPending,
    switchError: switchContextMutation.error,
  };
};
