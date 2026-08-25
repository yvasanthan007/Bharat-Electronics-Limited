import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { errorResponse } from '../utils/response';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(errorResponse('No token provided'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json(errorResponse('Unauthorized or invalid token'));
  }
};
