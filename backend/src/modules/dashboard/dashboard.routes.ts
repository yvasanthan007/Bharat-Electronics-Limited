import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { asyncHandler } from '../../middleware/asyncHandler';

const router = Router();

// Dashboard analytics & metrics
router.get('/summary', asyncHandler(dashboardController.getSummary));
router.get('/charts', asyncHandler(dashboardController.getCharts));
router.get('/activity', asyncHandler(dashboardController.getActivity));
router.get('/blockchain-status', asyncHandler(dashboardController.getBlockchainStatus));

export default router;
