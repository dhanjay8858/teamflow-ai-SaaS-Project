import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../config/api.client';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { WorkspaceInvitation, CreateInvitationPayload } from '../../../types/invitation';
import { AuthApiResponse } from '../../../types/auth';

export const useInvitations = () => {
  const queryClient = useQueryClient();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const usePendingInvitations = (workspaceId?: string) => {
    const targetWsId = workspaceId || currentWorkspace?._id;
    return useQuery<AuthApiResponse<{ invitations: WorkspaceInvitation[] }>>({
      queryKey: ['workspace-invitations', targetWsId],
      queryFn: async () => {
        if (!targetWsId) return { success: true, message: '', data: { invitations: [] } };
        return apiClient.get<unknown, AuthApiResponse<{ invitations: WorkspaceInvitation[] }>>(
          `/invitations?workspaceId=${targetWsId}`
        );
      },
      enabled: !!targetWsId,
    });
  };

  const useValidateToken = (token: string) =>
    useQuery<AuthApiResponse<{ invitation: WorkspaceInvitation }>>({
      queryKey: ['validate-invitation-token', token],
      queryFn: async () => {
        return apiClient.get<unknown, AuthApiResponse<{ invitation: WorkspaceInvitation }>>(
          `/invitations/${token}`
        );
      },
      enabled: !!token,
      retry: false,
    });

  const createInvitationMutation = useMutation<
    AuthApiResponse<{ invitation: WorkspaceInvitation; invitationLink: string; token: string }>,
    Error,
    CreateInvitationPayload
  >({
    mutationFn: async (payload) => {
      return apiClient.post('/invitations', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations'] });
    },
  });

  const acceptInvitationMutation = useMutation<AuthApiResponse<void>, Error, string>({
    mutationFn: async (token) => {
      return apiClient.post(`/invitations/${token}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-organizations'] });
      queryClient.invalidateQueries({ queryKey: ['org-workspaces'] });
    },
  });

  const declineInvitationMutation = useMutation<AuthApiResponse<void>, Error, string>({
    mutationFn: async (token) => {
      return apiClient.post(`/invitations/${token}/decline`);
    },
  });

  const cancelInvitationMutation = useMutation<AuthApiResponse<void>, Error, string>({
    mutationFn: async (id) => {
      return apiClient.post(`/invitations/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations'] });
    },
  });

  const resendInvitationMutation = useMutation<
    AuthApiResponse<{ invitation: WorkspaceInvitation; token: string }>,
    Error,
    string
  >({
    mutationFn: async (id) => {
      return apiClient.post(`/invitations/${id}/resend`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-invitations'] });
    },
  });

  return {
    usePendingInvitations,
    useValidateToken,

    createInvitation: createInvitationMutation.mutateAsync,
    isCreatingInvitation: createInvitationMutation.isPending,
    createInvitationError: createInvitationMutation.error,

    acceptInvitation: acceptInvitationMutation.mutateAsync,
    isAccepting: acceptInvitationMutation.isPending,

    declineInvitation: declineInvitationMutation.mutateAsync,
    isDeclining: declineInvitationMutation.isPending,

    cancelInvitation: cancelInvitationMutation.mutateAsync,
    isCancelling: cancelInvitationMutation.isPending,

    resendInvitation: resendInvitationMutation.mutateAsync,
    isResending: resendInvitationMutation.isPending,
  };
};
