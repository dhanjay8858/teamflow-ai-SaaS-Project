import { z } from 'zod';

export const aiQuerySchema = z.object({
  body: z.object({
    prompt: z.string().min(1, 'Prompt is required').max(10000, 'Prompt too long'),
    workspaceId: z.string().min(1, 'workspaceId is required'),
    projectId: z.string().optional(),
    taskId: z.string().optional(),
  }),
});

export const aiEmbedTestSchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Text is required').max(5000),
  }),
});

export type AIQueryBody = z.infer<typeof aiQuerySchema>['body'];
export type AIEmbedTestBody = z.infer<typeof aiEmbedTestSchema>['body'];
