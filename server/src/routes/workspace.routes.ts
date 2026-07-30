import { Router } from 'express';
import { workspaceController } from '../controllers/workspace.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createWorkspaceSchema, updateWorkspaceSchema } from '../validators/workspace.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', workspaceController.getOrgWorkspaces);
router.post('/', validateRequest(createWorkspaceSchema), workspaceController.create);
router.get('/:id', workspaceController.getById);
router.patch('/:id', validateRequest(updateWorkspaceSchema), workspaceController.update);
router.delete('/:id', workspaceController.archive);

export const workspaceRoutes = router;
