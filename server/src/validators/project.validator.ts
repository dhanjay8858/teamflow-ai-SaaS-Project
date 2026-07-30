import { z } from 'zod';
import { ProjectStatus, ProjectVisibility, ProjectMemberRole } from '../types/project.types.js';

export const createProjectSchema = z.object({
  body: z.object({
    workspaceId: z.string().min(1, 'Workspace ID is required'),
    name: z.string().min(2, 'Project name must be at least 2 characters long').max(80).trim(),
    slug: z.string().min(2).max(50).toLowerCase().trim(),
    description: z.string().max(500).optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    visibility: z.nativeEnum(ProjectVisibility).optional(),
    startDate: z.string().optional(),
    targetDate: z.string().optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Project ID is required'),
  }),
  body: z.object({
    name: z.string().min(2).max(80).trim().optional(),
    description: z.string().max(500).optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
    visibility: z.nativeEnum(ProjectVisibility).optional(),
    startDate: z.string().optional(),
    targetDate: z.string().optional(),
  }),
});

export const addProjectMemberSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Project ID is required'),
  }),
  body: z.object({
    userId: z.string().min(1, 'User ID is required'),
    role: z.nativeEnum(ProjectMemberRole).optional(),
  }),
});

export const updateProjectRoleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Project ID is required'),
    memberId: z.string().min(1, 'Member ID is required'),
  }),
  body: z.object({
    role: z.nativeEnum(ProjectMemberRole),
  }),
});
