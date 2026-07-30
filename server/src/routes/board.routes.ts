import { Router } from 'express';
import { boardController } from '../controllers/board.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createBoardSchema, updateBoardSchema, reorderBoardsSchema } from '../validators/board.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', boardController.getProjectBoards);
router.post('/', validateRequest(createBoardSchema), boardController.create);
router.post('/reorder', validateRequest(reorderBoardsSchema), boardController.reorder);
router.get('/:id', boardController.getById);
router.patch('/:id', validateRequest(updateBoardSchema), boardController.update);
router.delete('/:id', boardController.archive);

export const boardRoutes = router;
