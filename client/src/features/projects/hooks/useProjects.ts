import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../config/api.client';
import { useWorkspaceStore } from '../../../stores/workspace.store';
import { Project, ProjectMember, CreateProjectPayload, UpdateProjectPayload, ProjectMemberRole } from '../../../types/project';
import { AuthApiResponse } from '../../../types/auth';

export const useProjects = () => {
  const queryClient = useQueryClient();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const useWorkspaceProjects = (includeArchived = false) => {
    const wsId = currentWorkspace?._id;
    return useQuery<AuthApiResponse<{ projects: Project[] }>>({
      queryKey: ['workspace-projects', wsId, includeArchived],
      queryFn: async () => {
        if (!wsId) return { success: true, message: '', data: { projects: [] } };
        return apiClient.get<unknown, AuthApiResponse<{ projects: Project[] }>>(
          `/projects?workspaceId=${wsId}&includeArchived=${includeArchived}`
        );
      },
      enabled: !!wsId,
    });
  };

  const useProjectDetails = (projectId?: string) =>
    useQuery<AuthApiResponse<{ project: Project }>>({
      queryKey: ['project-details', projectId],
      queryFn: async () => {
        if (!projectId) throw new Error('Project ID required');
        return apiClient.get<unknown, AuthApiResponse<{ project: Project }>>(`/projects/${projectId}`);
      },
      enabled: !!projectId,
    });

  const useProjectMembers = (projectId?: string) =>
    useQuery<AuthApiResponse<{ members: ProjectMember[] }>>({
      queryKey: ['project-members', projectId],
      queryFn: async () => {
        if (!projectId) return { success: true, message: '', data: { members: [] } };
        return apiClient.get<unknown, AuthApiResponse<{ members: ProjectMember[] }>>(`/projects/${projectId}/members`);
      },
      enabled: !!projectId,
    });

  const createProjectMutation = useMutation<AuthApiResponse<{ project: Project }>, Error, CreateProjectPayload>({
    mutationFn: async (payload) => {
      return apiClient.post('/projects', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-projects'] });
    },
  });

  const updateProjectMutation = useMutation<
    AuthApiResponse<{ project: Project }>,
    Error,
    { projectId: string; payload: UpdateProjectPayload }
  >({
    mutationFn: async ({ projectId, payload }) => {
      return apiClient.patch(`/projects/${projectId}`, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-details', variables.projectId] });
    },
  });

  const archiveProjectMutation = useMutation<AuthApiResponse<void>, Error, string>({
    mutationFn: async (projectId) => {
      return apiClient.delete(`/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-projects'] });
    },
  });

  const addProjectMemberMutation = useMutation<
    AuthApiResponse<{ member: ProjectMember }>,
    Error,
    { projectId: string; userId: string; role?: ProjectMemberRole }
  >({
    mutationFn: async ({ projectId, userId, role }) => {
      return apiClient.post(`/projects/${projectId}/members`, { userId, role });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', variables.projectId] });
    },
  });

  const updateProjectRoleMutation = useMutation<
    AuthApiResponse<{ member: ProjectMember }>,
    Error,
    { projectId: string; memberId: string; role: ProjectMemberRole }
  >({
    mutationFn: async ({ projectId, memberId, role }) => {
      return apiClient.patch(`/projects/${projectId}/members/${memberId}`, { role });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', variables.projectId] });
    },
  });

  const removeProjectMemberMutation = useMutation<
    AuthApiResponse<void>,
    Error,
    { projectId: string; memberId: string }
  >({
    mutationFn: async ({ projectId, memberId }) => {
      return apiClient.delete(`/projects/${projectId}/members/${memberId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['project-members', variables.projectId] });
    },
  });

  return {
    useWorkspaceProjects,
    useProjectDetails,
    useProjectMembers,

    createProject: createProjectMutation.mutateAsync,
    isCreating: createProjectMutation.isPending,
    createError: createProjectMutation.error,

    updateProject: updateProjectMutation.mutateAsync,
    isUpdating: updateProjectMutation.isPending,

    archiveProject: archiveProjectMutation.mutateAsync,
    isArchiving: archiveProjectMutation.isPending,

    addProjectMember: addProjectMemberMutation.mutateAsync,
    isAddingMember: addProjectMemberMutation.isPending,

    updateProjectRole: updateProjectRoleMutation.mutateAsync,
    isUpdatingRole: updateProjectRoleMutation.isPending,

    removeProjectMember: removeProjectMemberMutation.mutateAsync,
    isRemovingMember: removeProjectMemberMutation.isPending,
  };
};
