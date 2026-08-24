import { Router, Request, Response } from 'express';
import { ApiResponse } from '../../shared/utils/response';
import { asyncHandler } from '../../middleware/asyncHandler';

const router = Router();

router.get(
  '/growth',
  asyncHandler(async (_req: Request, res: Response) => {
    const data = [
      { month: 'Mar', value: 180000 },
      { month: 'Apr', value: 220000 },
      { month: 'May', value: 290000 },
      { month: 'Jun', value: 340000 },
      { month: 'Jul', value: 410000 },
      { month: 'Aug', value: 485000 },
    ];
    ApiResponse.success(res, data, 'Portfolio growth analytics retrieved');
  })
);

router.get(
  '/heatmap',
  asyncHandler(async (_req: Request, res: Response) => {
    const heatmap = [
      { day: 'Mon', '00-06': 12, '06-12': 45, '12-18': 89, '18-24': 34 },
      { day: 'Tue', '00-06': 15, '06-12': 56, '12-18': 95, '18-24': 40 },
      { day: 'Wed', '00-06': 22, '06-12': 78, '12-18': 120, '18-24': 55 },
      { day: 'Thu', '00-06': 18, '06-12': 64, '12-18': 105, '18-24': 48 },
      { day: 'Fri', '00-06': 25, '06-12': 90, '12-18': 140, '18-24': 68 },
      { day: 'Sat', '00-06': 10, '06-12': 28, '12-18': 42, '18-24': 20 },
      { day: 'Sun', '00-06': 8, '06-12': 20, '12-18': 35, '18-24': 15 },
    ];
    ApiResponse.success(res, heatmap, 'Daily activity heatmap retrieved');
  })
);

router.get(
  '/network-usage',
  asyncHandler(async (_req: Request, res: Response) => {
    const data = {
      network: 'BEL Sovereign Testnet',
      tps: 45.8,
      peakTps: 120.0,
      avgBlockTime: '2.4s',
      dailyGasUsed: '42,850,000',
      activePeers: 18,
    };
    ApiResponse.success(res, data, 'Network usage benchmarks retrieved');
  })
);

router.get(
  '/top-assets',
  asyncHandler(async (_req: Request, res: Response) => {
    const topAssets = [
      { name: 'Radar Sensor Mk-IV', volume: '$1.4M', transactions: 420 },
      { name: 'bUSD Stablecoin', volume: '$2.8M', transactions: 1850 },
      { name: 'Avionics Module NFT', volume: '$620K', transactions: 190 },
    ];
    ApiResponse.success(res, topAssets, 'Top traded digital assets retrieved');
  })
);

export default router;
