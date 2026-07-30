import { Router } from 'express';
import { commentController } from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createCommentSchema,
  createReplySchema,
  updateCommentSchema,
  reactionSchema,
  restoreCommentSchema,
} from '../validators/comment.validator.js';

import { commentCreationLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// All comment routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/comments/task/:taskId
 * List all top-level comments for a task (with replies & reactions).
 */
router.get('/task/:taskId', commentController.getTaskComments);

/**
 * POST /api/v1/comments
 * Create a new top-level comment on a task.
 */
router.post('/', commentCreationLimiter, validateRequest(createCommentSchema), commentController.createComment);

/**
 * POST /api/v1/comments/:id/reply
 * Reply to an existing comment (max depth 1).
 */
router.post('/:id/reply', commentCreationLimiter, validateRequest(createReplySchema), commentController.createReply);

/**
 * PATCH /api/v1/comments/:id
 * Edit a comment (author only).
 */
router.patch('/:id', validateRequest(updateCommentSchema), commentController.updateComment);

/**
 * DELETE /api/v1/comments/:id
 * Soft-delete a comment (author or project manager).
 */
router.delete('/:id', commentController.deleteComment);

/**
 * POST /api/v1/comments/:id/restore
 * Restore a soft-deleted comment (author only).
 */
router.post('/:id/restore', validateRequest(restoreCommentSchema), commentController.restoreComment);

/**
 * POST /api/v1/comments/:id/reactions
 * Add an emoji reaction to a comment.
 */
router.post('/:id/reactions', validateRequest(reactionSchema), commentController.addReaction);

/**
 * DELETE /api/v1/comments/:id/reactions
 * Remove an emoji reaction from a comment.
 */
router.delete('/:id/reactions', validateRequest(reactionSchema), commentController.removeReaction);

/**
 * GET /api/v1/comments/:id/reactions
 * Get all reactions for a specific comment.
 */
router.get('/:id/reactions', commentController.getReactions);

export { router as commentRoutes };
