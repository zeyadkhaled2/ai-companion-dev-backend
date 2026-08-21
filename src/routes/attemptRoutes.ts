import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { submitAnswerController } from '../controllers/attemptController';
import { getAttemptsController } from '../controllers/attemptController';
const router = Router();

router.post('/', authMiddleware, submitAnswerController);
router.get('/', authMiddleware, getAttemptsController);
export default router;