import { Router } from 'express';
import { organizationController } from '../controllers/organization.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createOrganizationSchema, updateOrganizationSchema } from '../validators/organization.validator.js';

import { organizationCreationLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', organizationController.getUserOrganizations);
router.post('/', organizationCreationLimiter, validateRequest(createOrganizationSchema), organizationController.create);
router.get('/:id', organizationController.getById);
router.patch('/:id', validateRequest(updateOrganizationSchema), organizationController.update);
router.delete('/:id', organizationController.archive);

export const organizationRoutes = router;
