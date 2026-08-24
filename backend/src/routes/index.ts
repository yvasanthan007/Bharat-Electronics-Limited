import { Router, Request, Response } from 'express';
import { successResponse } from '../utils/response';
import authRoutes from '../modules/auth/auth.routes';
import usersRoutes from '../modules/users/users.routes';
import dashboardRoutes from '../modules/dashboard/dashboard.routes';
import assetsRoutes from '../modules/digital-assets/assets.routes';
import transactionsRoutes from './transaction.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';
import walletsRoutes from '../modules/wallets/wallets.routes';
import notificationsRoutes from '../modules/notifications/notifications.routes';

const router = Router();

// Health check
router.get('/health', (req: Request, res: Response) => {
  res.json(successResponse({ status: 'healthy', timestamp: new Date(), version: '1.0.0' }));
});

// Feature routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/assets', assetsRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/wallets', walletsRoutes);
router.use('/notifications', notificationsRoutes);

export default router;
