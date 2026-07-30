import { Router } from 'express';
import { agentController } from '../controllers/agent.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = Router();

router.post('/run', authenticate, agentController.run);
router.post('/run-stream', authenticate, agentController.runStream);
router.post('/approve', authenticate, agentController.approve);
router.post('/reject', authenticate, agentController.reject);

router.get('/', authenticate, agentController.listAgents);
router.get('/history', authenticate, agentController.getMemory);
router.get('/memory', authenticate, agentController.getMemory);
router.get('/reflections', authenticate, agentController.getReflections);
router.get('/status', agentController.getStatus);

router.get('/runtime', authenticate, agentController.getRuntime);
router.get('/metrics', authenticate, agentController.getMetrics);

export { router as agentRoutes };
