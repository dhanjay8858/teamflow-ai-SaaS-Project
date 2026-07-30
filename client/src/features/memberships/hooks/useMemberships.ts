import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../config/api.client';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { Membership, MembershipRole } from '../../../types/organization';
import { AuthApiResponse } from '../../../types/auth';

export const useMemberships = () => {
  const queryClient = useQueryClient();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const useWorkspaceMembers = (workspaceId?: string) => {
    const targetWsId = workspaceId || currentWorkspace?._id;
    return useQuery<AuthApiResponse<{ members: Membership[] }>>({
      queryKey: ['workspace-members', targetWsId],
      queryFn: async () => {
        if (!targetWsId) return { success: true, message: '', data: { members: [] } };
        return apiClient.get<unknown, AuthApiResponse<{ members: Membership[] }>>(
          `/memberships?workspaceId=${targetWsId}`
        );
      },
      enabled: !!targetWsId,
    });
  };

  const updateRoleMutation = useMutation<
    AuthApiResponse<{ membership: Membership }>,
    Error,
    { membershipId: string; role: MembershipRole }
  >({
    mutationFn: async ({ membershipId, role }) => {
      return apiClient.patch(`/memberships/${membershipId}`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
    },
  });

  const removeMemberMutation = useMutation<AuthApiResponse<void>, Error, string>({
    mutationFn: async (membershipId) => {
      return apiClient.delete(`/memberships/${membershipId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members'] });
    },
  });

  return {
    useWorkspaceMembers,
    updateRole: updateRoleMutation.mutateAsync,
    isUpdatingRole: updateRoleMutation.isPending,

    removeMember: removeMemberMutation.mutateAsync,
    isRemovingMember: removeMemberMutation.isPending,
  };
};
