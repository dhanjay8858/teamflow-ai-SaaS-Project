import { z } from 'zod';

export const uploadFileSchema = z.object({
  query: z.object({
    workspaceId: z.string().min(1, 'workspaceId is required'),
    projectId: z.string().optional(),
    taskId: z.string().optional(),
  }),
});

export const renameFileSchema = z.object({
  body: z.object({
    displayName: z.string().min(1, 'Display name is required').max(255, 'Display name cannot exceed 255 characters'),
  }),
});

export type UploadFileQuery = z.infer<typeof uploadFileSchema>['query'];
export type RenameFileBody = z.infer<typeof renameFileSchema>['body'];
