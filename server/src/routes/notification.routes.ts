import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  getNotificationsQuerySchema,
  notificationIdParamSchema,
} from '../validators/notification.validator.js';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/notifications
 * Get cursor-paginated notifications for current user.
 */
router.get('/', validateRequest(getNotificationsQuerySchema), notificationController.getNotifications);

/**
 * GET /api/v1/notifications/unread-count
 * Get count of unread notifications for current user.
 */
router.get('/unread-count', notificationController.getUnreadCount);

/**
 * PATCH /api/v1/notifications/read-all
 * Mark all unread notifications for current user as read.
 */
router.patch('/read-all', notificationController.markAllRead);

/**
 * PATCH /api/v1/notifications/:id/read
 * Mark a single notification as read.
 */
router.patch('/:id/read', validateRequest(notificationIdParamSchema), notificationController.markRead);

/**
 * DELETE /api/v1/notifications/:id
 * Delete a notification.
 */
router.delete('/:id', validateRequest(notificationIdParamSchema), notificationController.delete);

export { router as notificationRoutes };
