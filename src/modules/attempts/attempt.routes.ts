import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { submitAnswerController } from './attempt.controller';
import { getAttemptsController } from './attempt.controller';
import { getStatsController } from './attempt.controller';
const router = Router();

router.post('/', authMiddleware, submitAnswerController);
router.get('/', authMiddleware, getAttemptsController);
router.get('/stats', authMiddleware, getStatsController);
export default router;
