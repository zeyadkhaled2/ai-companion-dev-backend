import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { sendMessageController } from '../controllers/chatController';

const router = Router();

router.post('/message', authMiddleware, sendMessageController);

export default router;