import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { errorResponse } from '../utils/response';
import { prisma } from '../database';

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
  } catch (_error) {
    return res.status(401).json(errorResponse('Unauthorized or invalid token'));
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json(errorResponse('Unauthorized: Authentication required'));
      }

      let userRole = user.role;
      if (!userRole && user.userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.userId },
          include: { role: true },
        });
        userRole = dbUser?.role?.name;
      }

      const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
      if (!userRole || !normalizedAllowed.includes(userRole.toUpperCase())) {
        return res.status(403).json(errorResponse('Forbidden: Insufficient permissions'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireAdmin = requireRole(['ADMIN']);

