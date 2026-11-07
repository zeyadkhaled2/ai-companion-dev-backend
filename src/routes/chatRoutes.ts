import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getLatestConversationController, sendMessageController } from '../controllers/chatController';

const router = Router();

router.post('/message', authMiddleware, sendMessageController);
router.get('/conversation', authMiddleware, getLatestConversationController);

export default router;
