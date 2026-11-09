import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes';
import questionRoutes from './modules/practice/question.routes';
import attemptRoutes from './modules/attempts/attempt.routes';
import chatRoutes from './modules/chat/chat.routes';
import streakRoutes from './modules/streak/streak.routes';
const app = express();

app.use(cors());
app.use(express.json({ limit: '450kb' }));

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/streak', streakRoutes);

export default app;
