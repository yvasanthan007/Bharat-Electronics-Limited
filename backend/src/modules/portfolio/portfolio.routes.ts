import { Router, Request, Response } from 'express';
import { dbStore } from '../../database/mockDataStore';
import { ApiResponse } from '../../shared/utils/response';
import { asyncHandler } from '../../middleware/asyncHandler';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const totalValueUsd = dbStore.assets.reduce((sum, a) => sum + a.marketValueUsd, 0);
    const totalHoldings = dbStore.assets.reduce((sum, a) => sum + a.quantity, 0);

    const portfolio = {
      userId: 'usr-admin-01',
      totalValueUsd,
      totalHoldings,
      dayChangeUsd: 14200,
      dayChangePercentage: 4.82,
      weekChangePercentage: 12.4,
      monthChangePercentage: 24.8,
      bestPerformer: 'BEL Radar Sensor (+20.8%)',
      worstPerformer: 'bUSD Stablecoin (0.0%)',
    };

    ApiResponse.success(res, portfolio, 'Portfolio summary retrieved');
  })
);

router.get(
  '/allocation',
  asyncHandler(async (_req: Request, res: Response) => {
    const totalValue = dbStore.assets.reduce((sum, a) => sum + a.marketValueUsd, 0) || 1;
    const categories = [
      { category: 'Tokenized Defense Hardware', value: 237000, percentage: 63, color: '#2563eb' },
      { category: 'Stablecoins (bUSD)', value: 140000, percentage: 37, color: '#10b981' },
    ];
    ApiResponse.success(res, { totalValue, categories }, 'Portfolio allocation breakdown');
  })
);

router.get(
  '/performance',
  asyncHandler(async (req: Request, res: Response) => {
    const period = (req.query.period as string) || '30D';
    const points = [
      { date: '2026-08-01', value: 320000 },
      { date: '2026-08-08', value: 345000 },
      { date: '2026-08-15', value: 360000 },
      { date: '2026-08-22', value: 377000 },
    ];
    ApiResponse.success(res, { period, points }, 'Portfolio historical performance');
  })
);

export default router;
