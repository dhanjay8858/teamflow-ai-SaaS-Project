import { Router } from 'express';
import { activityController } from '../controllers/activity.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/workspace/:workspaceId', activityController.getWorkspaceTimeline);
router.get('/organization/:organizationId', activityController.getOrganizationTimeline);
router.get('/', activityController.getWorkspaceTimeline);

export const activityRoutes = router;
