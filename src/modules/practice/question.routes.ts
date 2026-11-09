import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { generateQuestion } from './question.controller';

const router = Router();

router.post('/generate', authMiddleware, generateQuestion);

export default router;
