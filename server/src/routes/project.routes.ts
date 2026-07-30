import { Router } from 'express';
import { projectController } from '../controllers/project.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createProjectSchema,
  updateProjectSchema,
  addProjectMemberSchema,
  updateProjectRoleSchema,
} from '../validators/project.validator.js';

const router = Router();

router.use(authenticate);

// Project Core Routes
router.get('/', projectController.getWorkspaceProjects);
router.post('/', validateRequest(createProjectSchema), projectController.create);
router.get('/:id', projectController.getById);
router.patch('/:id', validateRequest(updateProjectSchema), projectController.update);
router.delete('/:id', projectController.archive);

// Project Member Routes
router.get('/:id/members', projectController.getMembers);
router.post('/:id/members', validateRequest(addProjectMemberSchema), projectController.addMember);
router.patch('/:id/members/:memberId', validateRequest(updateProjectRoleSchema), projectController.updateMemberRole);
router.delete('/:id/members/:memberId', projectController.removeMember);

export const projectRoutes = router;
