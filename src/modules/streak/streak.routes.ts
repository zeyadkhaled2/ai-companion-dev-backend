import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../../shared/middleware/auth.middleware';
import { recordLoginDay } from './streak.service';

const router = Router();
router.post('/check-in', authMiddleware, async (req: AuthRequest, res) => {
  if (!req.userId) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }
  res.json(await recordLoginDay(req.userId));
});

export default router;
