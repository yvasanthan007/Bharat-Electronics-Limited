import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../../utils/response';
import { prisma } from '../../database';

export class AnalyticsController {
  async getPortfolioGrowth(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(successResponse({
        labels: ['Jan','Feb','Mar','Apr','May','Jun'],
        data: [100000, 112000, 108000, 135000, 142000, 160000],
      }));
    } catch (error) { next(error); }
  }

  async getAssetAllocation(req: Request, res: Response, next: NextFunction) {
    try {
      const assets = await prisma.asset.findMany({ take: 5 });
      const allocation = assets.map(a => ({ name: a.name, symbol: a.symbol, value: a.price * 100 }));
      res.json(successResponse(allocation));
    } catch (error) { next(error); }
  }

  async getTransactionVolume(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(successResponse({
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        data: [3200, 5100, 4200, 7800, 6900, 3400, 2100],
      }));
    } catch (error) { next(error); }
  }

  async getMonthlySummary(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(successResponse({
        month: 'August',
        totalDeposits: 12000,
        totalWithdrawals: 4500,
        netGrowth: 7500,
        topAsset: 'BTC',
      }));
    } catch (error) { next(error); }
  }

  async getTopAssets(req: Request, res: Response, next: NextFunction) {
    try {
      const assets = await prisma.asset.findMany({
        orderBy: { price: 'desc' },
        take: 5,
      });
      res.json(successResponse(assets));
    } catch (error) { next(error); }
  }
}
