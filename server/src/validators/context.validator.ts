import { z } from 'zod';

export const switchWorkspaceSchema = z.object({
  body: z.object({
    organizationSlug: z.string().min(1, 'Organization slug is required').toLowerCase().trim(),
    workspaceSlug: z.string().min(1, 'Workspace slug is required').toLowerCase().trim(),
  }),
});
