import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { generateQuestion } from '../controllers/questionController';

const router = Router();

router.post('/generate', authMiddleware, generateQuestion);

export default router;