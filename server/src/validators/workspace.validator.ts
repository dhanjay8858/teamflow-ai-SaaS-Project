import { z } from 'zod';
import { WorkspaceVisibility } from '../types/organization.types.js';

export const createWorkspaceSchema = z.object({
  body: z.object({
    organizationId: z.string().min(1, 'Organization ID is required'),
    name: z.string().min(2, 'Workspace name must be at least 2 characters long').max(50).trim(),
    slug: z
      .string()
      .min(2)
      .max(50)
      .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
      .toLowerCase()
      .trim(),
    description: z.string().max(200).optional(),
    icon: z.string().optional(),
    visibility: z.nativeEnum(WorkspaceVisibility).optional(),
  }),
});

export const updateWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).trim().optional(),
    description: z.string().max(200).optional(),
    icon: z.string().optional(),
    visibility: z.nativeEnum(WorkspaceVisibility).optional(),
  }),
});
