import { Router } from 'express';
import { workspaceInvitationController } from '../controllers/invitation.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createInvitationSchema,
  invitationTokenParamSchema,
  invitationIdParamSchema,
} from '../validators/invitation.validator.js';

const router = Router();

// Public Diagnostic & Action Routes
router.get('/test-email/send', workspaceInvitationController.testEmail);
router.get('/:token', validateRequest(invitationTokenParamSchema), workspaceInvitationController.validateToken);
router.post('/:token/decline', validateRequest(invitationTokenParamSchema), workspaceInvitationController.decline);

import { invitationSendingLimiter } from '../middleware/rateLimit.middleware.js';

// Authenticated Routes
router.use(authenticate);

router.post('/', invitationSendingLimiter, validateRequest(createInvitationSchema), workspaceInvitationController.create);
router.get('/', workspaceInvitationController.getWorkspacePendingInvitations);
router.post('/:token/accept', validateRequest(invitationTokenParamSchema), workspaceInvitationController.accept);
router.post('/:id/cancel', validateRequest(invitationIdParamSchema), workspaceInvitationController.cancel);
router.post('/:id/resend', validateRequest(invitationIdParamSchema), workspaceInvitationController.resend);

export const invitationRoutes = router;
