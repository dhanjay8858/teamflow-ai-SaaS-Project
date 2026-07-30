import { z } from 'zod';

const markdownSchema = z
  .string()
  .min(1, 'Comment cannot be empty')
  .max(50000, 'Comment cannot exceed 50,000 characters');

const attachmentIdsSchema = z
  .array(z.string().min(1))
  .max(10, 'Cannot attach more than 10 files per comment')
  .optional();

export const createCommentSchema = z.object({
  body: z.object({
    taskId: z.string().min(1, 'taskId is required'),
    markdown: markdownSchema,
    attachmentIds: attachmentIdsSchema,
  }),
});

export const createReplySchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Comment ID is required'),
  }),
  body: z.object({
    taskId: z.string().min(1, 'taskId is required'),
    markdown: markdownSchema,
    attachmentIds: attachmentIdsSchema,
  }),
});

export const updateCommentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Comment ID is required'),
  }),
  body: z.object({
    markdown: markdownSchema,
    attachmentIds: attachmentIdsSchema,
  }),
});

export const reactionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Comment ID is required'),
  }),
  body: z.object({
    emoji: z.string().min(1, 'Emoji is required').max(10, 'Invalid emoji'),
  }),
});

export const restoreCommentSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Comment ID is required'),
  }),
  body: z.object({
    originalMarkdown: z.string().min(1, 'Original markdown content is required for restoration'),
  }),
});

export type CreateCommentBody = z.infer<typeof createCommentSchema>['body'];
export type UpdateCommentBody = z.infer<typeof updateCommentSchema>['body'];
export type ReactionBody = z.infer<typeof reactionSchema>['body'];
