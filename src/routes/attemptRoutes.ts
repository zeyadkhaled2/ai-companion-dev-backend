import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { submitAnswerController } from '../controllers/attemptController';

const router = Router();

router.post('/', authMiddleware, submitAnswerController);

export default router;