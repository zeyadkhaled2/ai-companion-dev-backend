import { Router } from 'express';
import { register, login, getProfile, updateProfilePhoto } from './auth.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);

router.patch('/profile/photo', authMiddleware, updateProfilePhoto);

export default router;
