import { Request, Response, NextFunction } from 'express';
import { successResponse, errorResponse } from '../../utils/response';
import { prisma } from '../../database';

export class WalletsController {
  async getMyWallets(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const wallets = await prisma.wallet.findMany({ where: { userId } });
      res.json(successResponse(wallets));
    } catch (error) { next(error); }
  }

  async getWalletById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const wallet = await prisma.wallet.findUnique({ where: { id }, include: { transactions: { take: 10, orderBy: { createdAt: 'desc' } } } });
      if (!wallet) return res.status(404).json(errorResponse('Wallet not found'));
      res.json(successResponse(wallet));
    } catch (error) { next(error); }
  }
}
