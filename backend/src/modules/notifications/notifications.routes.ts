import { Router, Request, Response } from 'express';
import { dbStore, MockNotification } from '../../database/mockDataStore';
import { ApiResponse } from '../../shared/utils/response';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from '../../middleware/asyncHandler';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const unreadCount = dbStore.notifications.filter((n) => !n.isRead).length;
    ApiResponse.success(res, { notifications: dbStore.notifications, unreadCount }, 'Notifications retrieved');
  })
);

router.patch(
  '/:id/read',
  asyncHandler(async (req: Request, res: Response) => {
    const notif = dbStore.notifications.find((n) => n.id === req.params.id);
    if (notif) {
      notif.isRead = true;
    }
    ApiResponse.success(res, notif, 'Notification marked as read');
  })
);

router.patch(
  '/read-all',
  asyncHandler(async (_req: Request, res: Response) => {
    dbStore.notifications.forEach((n) => (n.isRead = true));
    ApiResponse.success(res, { markedAllRead: true }, 'All notifications marked as read');
  })
);

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const newNotif: MockNotification = {
      id: `notif-${uuidv4().substring(0, 8)}`,
      userId: req.body.userId || 'usr-admin-01',
      title: req.body.title,
      message: req.body.message,
      type: req.body.type || 'SYSTEM_STATUS',
      isRead: false,
      createdAt: new Date(),
    };
    dbStore.notifications.unshift(newNotif);
    ApiResponse.created(res, newNotif, 'Notification dispatched');
  })
);

export default router;
