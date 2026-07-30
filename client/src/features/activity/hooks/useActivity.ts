import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../config/api.client';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { useOrganizationStore } from '../../../stores/organization.store';
import { PaginatedActivities, ActivityFilterParams } from '../../../types/activity';
import { AuthApiResponse } from '../../../types/auth';

export const useActivity = () => {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const currentOrganization = useOrganizationStore((state) => state.currentOrganization);

  const useWorkspaceActivity = (filters: Omit<ActivityFilterParams, 'workspaceId'> = {}) => {
    const wsId = currentWorkspace?._id;
    return useQuery<AuthApiResponse<PaginatedActivities>>({
      queryKey: ['workspace-activity', wsId, filters],
      queryFn: async () => {
        if (!wsId) return { success: true, message: '', data: { activities: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 1 } } };
        const queryParams = new URLSearchParams();
        if (filters.page) queryParams.append('page', filters.page.toString());
        if (filters.limit) queryParams.append('limit', filters.limit.toString());
        if (filters.eventType) queryParams.append('eventType', filters.eventType);
        if (filters.entityType) queryParams.append('entityType', filters.entityType);

        return apiClient.get<unknown, AuthApiResponse<PaginatedActivities>>(
          `/activity/workspace/${wsId}?${queryParams.toString()}`
        );
      },
      enabled: !!wsId,
    });
  };

  const useOrganizationActivity = (filters: Omit<ActivityFilterParams, 'organizationId'> = {}) => {
    const orgId = currentOrganization?._id;
    return useQuery<AuthApiResponse<PaginatedActivities>>({
      queryKey: ['organization-activity', orgId, filters],
      queryFn: async () => {
        if (!orgId) return { success: true, message: '', data: { activities: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 1 } } };
        const queryParams = new URLSearchParams();
        if (filters.page) queryParams.append('page', filters.page.toString());
        if (filters.limit) queryParams.append('limit', filters.limit.toString());
        if (filters.eventType) queryParams.append('eventType', filters.eventType);
        if (filters.entityType) queryParams.append('entityType', filters.entityType);

        return apiClient.get<unknown, AuthApiResponse<PaginatedActivities>>(
          `/activity/organization/${orgId}?${queryParams.toString()}`
        );
      },
      enabled: !!orgId,
    });
  };

  return {
    useWorkspaceActivity,
    useOrganizationActivity,
  };
};
