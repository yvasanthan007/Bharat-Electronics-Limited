import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';

const router = Router();
const ctrl = new AnalyticsController();

router.get('/portfolio-growth', ctrl.getPortfolioGrowth);
router.get('/asset-allocation', ctrl.getAssetAllocation);
router.get('/transaction-volume', ctrl.getTransactionVolume);
router.get('/monthly-summary', ctrl.getMonthlySummary);
router.get('/top-assets', ctrl.getTopAssets);

export default router;
