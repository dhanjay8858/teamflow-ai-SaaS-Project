import { Router } from 'express';
import { membershipController } from '../controllers/membership.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { addMemberSchema, updateRoleSchema } from '../validators/membership.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', membershipController.getWorkspaceMembers);
router.post('/', validateRequest(addMemberSchema), membershipController.addMember);
router.patch('/:id', validateRequest(updateRoleSchema), membershipController.updateRole);
router.delete('/:id', membershipController.removeMember);

export const membershipRoutes = router;
