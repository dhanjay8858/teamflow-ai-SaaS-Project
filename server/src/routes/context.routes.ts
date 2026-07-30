import { Router } from 'express';
import { workspaceContextController } from '../controllers/context.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { switchWorkspaceSchema } from '../validators/context.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', workspaceContextController.getCurrentContext);
router.post('/switch', validateRequest(switchWorkspaceSchema), workspaceContextController.switchWorkspace);

export const contextRoutes = router;
