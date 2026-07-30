import { z } from 'zod';

export const watchTaskSchema = z.object({
  body: z.object({
    taskId: z.string().min(1, 'taskId is required'),
  }),
});

export const recordRecentViewSchema = z.object({
  body: z.object({
    taskId: z.string().min(1, 'taskId is required'),
  }),
});
