import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../../utils/response';
import { prisma } from '../../database';

export class DashboardController {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;

      // Mock aggregated data or fetch via Prisma
      const totalBalance = 245000.50; // In a real app, calculate from Wallet/Portfolio
      const activeAssetsCount = 12;

      res.json(successResponse({
        totalBalance,
        activeAssetsCount,
        recentGrowth: 5.4 
      }));
    } catch (error) {
      next(error);
    }
  }

  async getCharts(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(successResponse({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        data: [10000, 15000, 13000, 22000, 24500]
      }));
    } catch (error) {
      next(error);
    }
  }

  async getActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const activities = await prisma.auditLog.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
      res.json(successResponse(activities));
    } catch (error) {
      next(error);
    }
  }

  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const notifications = await prisma.notification.findMany({
        where: { userId, isRead: false },
        take: 5,
        orderBy: { createdAt: 'desc' }
      });
      res.json(successResponse(notifications));
    } catch (error) {
      next(error);
    }
  }
}
