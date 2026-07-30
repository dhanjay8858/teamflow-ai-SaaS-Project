import { Router } from 'express';
import { fileController } from '../controllers/file.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { uploadFile } from '../middleware/fileUpload.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { renameFileSchema } from '../validators/file.validator.js';

import { fileUploadLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/files/upload?workspaceId=&projectId=&taskId=
 * Upload a file. Accepts multipart/form-data with field name "file".
 */
router.post('/upload', fileUploadLimiter, uploadFile, fileController.upload);

/**
 * GET /api/v1/files/:id
 * Get a single file by ID.
 */
router.get('/:id', fileController.getFile);

/**
 * PATCH /api/v1/files/:id/rename
 * Rename a file's display name.
 */
router.patch('/:id/rename', validateRequest(renameFileSchema), fileController.rename);

/**
 * DELETE /api/v1/files/:id
 * Soft-delete a file (only uploader can delete).
 */
router.delete('/:id', fileController.delete);

/**
 * POST /api/v1/files/:id/restore
 * Restore a soft-deleted file.
 */
router.post('/:id/restore', fileController.restore);

/**
 * GET /api/v1/files/workspace/:workspaceId
 * List all files in a workspace (most recent 50).
 */
router.get('/workspace/:workspaceId', fileController.getWorkspaceFiles);

/**
 * GET /api/v1/files/project/:projectId
 * List all files in a project.
 */
router.get('/project/:projectId', fileController.getProjectFiles);

/**
 * GET /api/v1/files/task/:taskId
 * List all files attached to a task.
 */
router.get('/task/:taskId', fileController.getTaskFiles);

export { router as fileRoutes };
