import { Router } from 'express';
import authRouter from '../modules/auth/auth.routes';
import usersRouter from '../modules/users/users.routes';
import dashboardRouter from '../modules/dashboard/dashboard.routes';
import assetsRouter from '../modules/assets/assets.routes';
import transactionsRouter from '../modules/transactions/transactions.routes';
import portfolioRouter from '../modules/portfolio/portfolio.routes';
import walletsRouter from '../modules/wallets/wallets.routes';
import analyticsRouter from '../modules/analytics/analytics.routes';
import notificationsRouter from '../modules/notifications/notifications.routes';
import reportsRouter from '../modules/reports/reports.routes';
import settingsRouter from '../modules/settings/settings.routes';
import healthRouter from '../modules/health/health.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/dashboard', dashboardRouter);
router.use('/assets', assetsRouter);
router.use('/transactions', transactionsRouter);
router.use('/portfolio', portfolioRouter);
router.use('/wallets', walletsRouter);
router.use('/analytics', analyticsRouter);
router.use('/notifications', notificationsRouter);
router.use('/reports', reportsRouter);
router.use('/settings', settingsRouter);
router.use('/health', healthRouter);

export default router;
