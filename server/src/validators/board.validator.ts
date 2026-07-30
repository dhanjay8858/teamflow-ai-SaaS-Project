import { z } from 'zod';

export const createBoardSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    name: z.string().min(2, 'Board name must be at least 2 characters long').max(50).trim(),
    slug: z.string().min(2).max(50).toLowerCase().trim(),
    description: z.string().max(300).optional(),
    color: z.string().optional(),
  }),
});

export const updateBoardSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Board ID is required'),
  }),
  body: z.object({
    name: z.string().min(2).max(50).trim().optional(),
    description: z.string().max(300).optional(),
    color: z.string().optional(),
  }),
});

export const reorderBoardsSchema = z.object({
  body: z.object({
    projectId: z.string().min(1, 'Project ID is required'),
    boards: z.array(
      z.object({
        boardId: z.string().min(1, 'boardId is required'),
        position: z.number().int().min(1),
      })
    ).min(1, 'At least one board position must be provided'),
  }),
});
