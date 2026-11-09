import { Router } from 'express';
import { authMiddleware } from '../../shared/middleware/auth.middleware';
import { getLatestConversationController, sendMessageController } from './chat.controller';

const router = Router();

router.post('/message', authMiddleware, sendMessageController);
router.get('/conversation', authMiddleware, getLatestConversationController);

export default router;
