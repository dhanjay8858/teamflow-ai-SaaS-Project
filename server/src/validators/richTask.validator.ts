import { z } from 'zod';

export const createChecklistSchema = z.object({
  body: z.object({
    taskId: z.string().min(1, 'taskId is required'),
    text: z.string().min(1, 'Text is required').max(300).trim(),
  }),
});

export const updateChecklistSchema = z.object({
  params: z.object({
    itemId: z.string().min(1, 'itemId is required'),
  }),
  body: z.object({
    text: z.string().min(1).max(300).trim().optional(),
    completed: z.boolean().optional(),
  }),
});

export const createSubtaskSchema = z.object({
  body: z.object({
    parentTaskId: z.string().min(1, 'parentTaskId is required'),
    boardId: z.string().min(1, 'boardId is required'),
    title: z.string().min(2).max(150).trim(),
    descriptionPreview: z.string().max(1000).optional(),
  }),
});

export const createDependencySchema = z.object({
  body: z.object({
    taskId: z.string().min(1, 'taskId is required'),
    dependsOnId: z.string().min(1, 'dependsOnId is required'),
  }),
});

export const updateTimeTrackingSchema = z.object({
  body: z.object({
    taskId: z.string().min(1, 'taskId is required'),
    estimateMinutes: z.number().min(0).optional(),
    spentMinutes: z.number().min(0).optional(),
  }),
});
