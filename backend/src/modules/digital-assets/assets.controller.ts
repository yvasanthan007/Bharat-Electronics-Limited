import { Request, Response, NextFunction } from 'express';
import { successResponse, errorResponse } from '../../utils/response';
import { prisma } from '../../database';

export class AssetsController {
  async getAllAssets(req: Request, res: Response, next: NextFunction) {
    try {
      const assets = await prisma.asset.findMany();
      res.json(successResponse(assets));
    } catch (error) {
      next(error);
    }
  }

  async getAssetById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const asset = await prisma.asset.findUnique({ where: { id } });
      if (!asset) return res.status(404).json(errorResponse('Asset not found'));
      res.json(successResponse(asset));
    } catch (error) {
      next(error);
    }
  }

  async getPortfolio(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      
      const wallets = await prisma.wallet.findMany({ where: { userId } });
      const walletIds = wallets.map(w => w.id);

      const portfolios = await prisma.portfolio.findMany({
        where: { walletId: { in: walletIds } },
        include: {
          items: {
            include: { asset: true }
          }
        }
      });

      res.json(successResponse(portfolios));
    } catch (error) {
      next(error);
    }
  }
}
