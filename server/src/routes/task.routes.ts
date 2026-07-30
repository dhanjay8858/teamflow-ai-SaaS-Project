import { Router } from 'express';
import { taskController } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  assignTaskSchema,
  taskStatusSchema,
  taskPrioritySchema,
  taskLabelsSchema,
} from '../validators/task.validator.js';
import {
  createChecklistSchema,
  updateChecklistSchema,
  createSubtaskSchema,
  createDependencySchema,
  updateTimeTrackingSchema,
} from '../validators/richTask.validator.js';
import { watchTaskSchema } from '../validators/collaboration.validator.js';

const router = Router();

router.use(authenticate);

// Watcher Routes
router.post('/watch', validateRequest(watchTaskSchema), taskController.watchTask);
router.delete('/watch/:taskId', taskController.unwatchTask);
router.get('/watch/:taskId', taskController.getWatchers);

// Task History Routes
router.get('/history', taskController.getHistory);

// Recently Viewed Routes
router.get('/recent', taskController.getRecentlyViewed);

// Checklist Routes
router.get('/checklist', taskController.getChecklist);
router.post('/checklist', validateRequest(createChecklistSchema), taskController.createChecklistItem);
router.patch('/checklist/:itemId', validateRequest(updateChecklistSchema), taskController.updateChecklistItem);
router.delete('/checklist/:itemId', taskController.deleteChecklistItem);

// Subtask Routes
router.post('/subtasks', validateRequest(createSubtaskSchema), taskController.createSubtask);

// Dependency Routes
router.get('/dependencies', taskController.getDependencies);
router.post('/dependencies', validateRequest(createDependencySchema), taskController.createDependency);
router.delete('/dependencies/:depId', taskController.deleteDependency);

// Time Tracking Routes
router.post('/time', validateRequest(updateTimeTrackingSchema), taskController.updateTimeTracking);

import { taskCreationLimiter } from '../middleware/rateLimit.middleware.js';

// Core Task Routes
router.get('/', taskController.getTasks);
router.post('/', taskCreationLimiter, validateRequest(createTaskSchema), taskController.create);
router.post('/move', validateRequest(moveTaskSchema), taskController.move);
router.post('/assign', validateRequest(assignTaskSchema), taskController.assign);
router.post('/status', validateRequest(taskStatusSchema), taskController.changeStatus);
router.post('/priority', validateRequest(taskPrioritySchema), taskController.changePriority);
router.post('/labels', validateRequest(taskLabelsSchema), taskController.updateLabels);

router.get('/:id', taskController.getById);
router.patch('/:id', validateRequest(updateTaskSchema), taskController.update);
router.delete('/:id', taskController.archive);

export const taskRoutes = router;
