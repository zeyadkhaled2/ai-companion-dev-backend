import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  // Step 1 & 2: check header exists and has the right format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  // Step 3: extract the actual token, stripping "Bearer " prefix
  const token = authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  try {
    // Step 4: verify — throws if invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };

    // Step 5: attach userId to req, then continue to the actual route
    req.userId = decoded.userId;
    next();
  } catch (err) {
    // Step 6: invalid/expired token
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}