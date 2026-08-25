import { Router } from 'express';
import { NotificationsController } from './notifications.controller';

const router = Router();
const ctrl = new NotificationsController();

router.get('/', ctrl.getMyNotifications);
router.patch('/:id/read', ctrl.markAsRead);
router.patch('/read-all', ctrl.markAllAsRead);

export default router;
