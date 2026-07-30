import { Router } from 'express';
import { healthController } from '../controllers/health.controller.js';

const router = Router();

// GET /api/v1/health - Detailed component health status (200 / 503)
router.get('/', healthController.getHealth);

// GET /api/v1/health/ready - Kubernetes readiness probe (200 / 503)
router.get('/ready', healthController.getReady);

// GET /api/v1/health/live - Kubernetes liveness probe (200)
router.get('/live', healthController.getLive);

// GET /api/v1/health/metrics or registered at root /metrics
router.get('/metrics', healthController.getMetrics);

export const healthRoutes = router;
