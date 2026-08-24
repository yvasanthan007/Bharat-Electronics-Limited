import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../../utils/response';
import { prisma } from '../../database';

export class NotificationsController {
  async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { unread } = req.query;
      const where: any = { userId };
      if (unread === 'true') where.isRead = false;
      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      res.json(successResponse(notifications));
    } catch (error) { next(error); }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const notification = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
      res.json(successResponse(notification, 'Notification marked as read'));
    } catch (error) { next(error); }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      res.json(successResponse(null, 'All notifications marked as read'));
    } catch (error) { next(error); }
  }
}
