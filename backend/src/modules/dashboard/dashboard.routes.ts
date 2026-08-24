import { Router } from 'express';
import { DashboardController } from './dashboard.controller';

const router = Router();
const dashboardController = new DashboardController();

// TODO: apply authMiddleware below
router.get('/summary', dashboardController.getSummary);
router.get('/charts', dashboardController.getCharts);
router.get('/activity', dashboardController.getActivity);
router.get('/notifications', dashboardController.getNotifications);

export default router;
