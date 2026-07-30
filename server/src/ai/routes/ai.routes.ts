import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { adminIndexController } from '../controllers/adminIndex.controller.js';
import { taskAssistantController } from '../controllers/taskAssistant.controller.js';
import { projectIntelligenceController } from '../project/controllers/projectIntelligence.controller.js';
import { aiCoreAdminController } from '../core/controllers/aiCoreAdmin.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { aiQuerySchema, aiEmbedTestSchema } from '../schemas/ai.validator.js';

const router = Router();

/**
 * GET /api/v1/ai/health
 * Detailed health status of LLM provider, Embeddings, and Vector Store.
 */
router.get('/health', aiController.getHealth);

/**
 * GET /api/v1/ai/providers
 * Active and available AI providers, embeddings, and vector stores.
 */
router.get('/providers', aiController.getProviders);

/**
 * POST /api/v1/ai/query
 * Execute LangGraph query workflow with context retrieval and tool selection.
 */
router.post('/query', authenticate, validateRequest(aiQuerySchema), aiController.processQuery);

/**
 * POST /api/v1/ai/stream
 * Stream generative response chunks over SSE (Server-Sent Events).
 */
router.post('/stream', authenticate, validateRequest(aiQuerySchema), aiController.streamQuery);

/**
 * POST /api/v1/ai/embed-test
 * Test embedding vector generation for a text input.
 */
router.post('/embed-test', validateRequest(aiEmbedTestSchema), aiController.embedTest);

/**
 * Task Assistant Endpoints
 */
router.post('/task-assistant/action', authenticate, taskAssistantController.executeAction);
router.post('/task-assistant/stream', authenticate, taskAssistantController.streamAction);

/**
 * Project & Sprint Intelligence Endpoints
 */
router.post('/project-assistant/action', authenticate, projectIntelligenceController.executeAction);
router.post('/project-assistant/stream', authenticate, projectIntelligenceController.streamAction);

/**
 * Admin Indexing Endpoints
 */
router.post('/index/rebuild', authenticate, adminIndexController.rebuildIndex);
router.get('/index/status', adminIndexController.getStatus);
router.get('/index/statistics', authenticate, adminIndexController.getStatistics);

/**
 * Core AI Platform Admin Observability Endpoints (/api/v1/ai/core/...)
 */
router.get('/core/health', authenticate, aiCoreAdminController.getHealth);
router.get('/core/providers', authenticate, aiCoreAdminController.getProviders);
router.get('/core/metrics', authenticate, aiCoreAdminController.getMetrics);
router.get('/core/audit', authenticate, aiCoreAdminController.getAudit);
router.get('/core/prompts', authenticate, aiCoreAdminController.getPrompts);
router.get('/core/planners', authenticate, aiCoreAdminController.getPlanners);
router.get('/core/tools', authenticate, aiCoreAdminController.getTools);
router.get('/core/config', authenticate, aiCoreAdminController.getConfig);

export { router as aiRoutes };
