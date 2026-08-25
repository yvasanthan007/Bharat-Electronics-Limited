import { Request, Response, NextFunction } from 'express';
import { successResponse, errorResponse } from '../../utils/response';
import { prisma } from '../../database';

export class UsersController {
  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId; // Set by auth middleware
      if (!userId) {
        return res.status(401).json(errorResponse('Unauthorized'));
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true, email: true, firstName: true, lastName: true, isActive: true,
          role: { select: { name: true } }
        }
      });

      if (!user) return res.status(404).json(errorResponse('User not found'));
      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { firstName, lastName } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { firstName, lastName },
        select: { id: true, email: true, firstName: true, lastName: true }
      });

      res.json(successResponse(user, 'Profile updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true, email: true, firstName: true, lastName: true, isActive: true,
          role: { select: { name: true } }, createdAt: true
        }
      });
      res.json(successResponse(users));
    } catch (error) {
      next(error);
    }
  }
}
