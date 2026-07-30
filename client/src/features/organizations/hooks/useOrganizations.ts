import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../config/api.client';
import { useOrganizationStore } from '../../../stores/organization.store';
import { Organization, CreateOrganizationPayload } from '../../../types/organization';
import { AuthApiResponse } from '../../../types/auth';

export const useOrganizations = () => {
  const queryClient = useQueryClient();
  const setOrganizations = useOrganizationStore((state) => state.setOrganizations);
  const setCurrentOrganization = useOrganizationStore((state) => state.setCurrentOrganization);
  const currentOrganization = useOrganizationStore((state) => state.currentOrganization);

  const useUserOrganizations = () =>
    useQuery<AuthApiResponse<{ organizations: Organization[] }>>({
      queryKey: ['user-organizations'],
      queryFn: async () => {
        const response = await apiClient.get<unknown, AuthApiResponse<{ organizations: Organization[] }>>('/organizations');
        if (response?.data?.organizations) {
          setOrganizations(response.data.organizations);
          if (!currentOrganization && response.data.organizations.length > 0) {
            setCurrentOrganization(response.data.organizations[0]);
          }
        }
        return response;
      },
    });

  const createOrgMutation = useMutation<
    AuthApiResponse<{ organization: Organization; defaultWorkspaceId: string }>,
    Error,
    CreateOrganizationPayload
  >({
    mutationFn: async (payload) => {
      return apiClient.post('/organizations', payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-organizations'] });
      if (data?.data?.organization) {
        setCurrentOrganization(data.data.organization);
      }
    },
  });

  const updateOrgMutation = useMutation<
    AuthApiResponse<{ organization: Organization }>,
    Error,
    { id: string; name?: string; description?: string }
  >({
    mutationFn: async ({ id, ...payload }) => {
      return apiClient.patch(`/organizations/${id}`, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-organizations'] });
      if (data?.data?.organization) {
        setCurrentOrganization(data.data.organization);
      }
    },
  });

  const archiveOrgMutation = useMutation<AuthApiResponse<void>, Error, string>({
    mutationFn: async (id) => {
      return apiClient.delete(`/organizations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-organizations'] });
      setCurrentOrganization(null);
    },
  });

  return {
    useUserOrganizations,
    createOrganization: createOrgMutation.mutateAsync,
    isCreatingOrg: createOrgMutation.isPending,
    createOrgError: createOrgMutation.error,

    updateOrganization: updateOrgMutation.mutateAsync,
    isUpdatingOrg: updateOrgMutation.isPending,

    archiveOrganization: archiveOrgMutation.mutateAsync,
    isArchivingOrg: archiveOrgMutation.isPending,
  };
};
