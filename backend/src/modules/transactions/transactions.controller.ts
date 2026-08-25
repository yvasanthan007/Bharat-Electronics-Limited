import { Request, Response, NextFunction } from 'express';
import { successResponse, errorResponse } from '../../utils/response';
import { prisma } from '../../database';

export class TransactionsController {
  async getAllTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const { status, type, page = '1', limit = '10' } = req.query;

      const userWallets = await prisma.wallet.findMany({ where: { userId }, select: { id: true } });
      const walletIds = userWallets.map(w => w.id);

      const filters: any = { walletId: { in: walletIds } };
      if (status) filters.status = status;
      if (type) filters.type = type;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where: filters,
          skip, take,
          orderBy: { createdAt: 'desc' },
          include: { asset: true, wallet: true }
        }),
        prisma.transaction.count({ where: filters })
      ]);

      res.json(successResponse({
        items: transactions,
        meta: { total, page: Number(page), limit: Number(limit) }
      }));
    } catch (error) {
      next(error);
    }
  }

  async getTransactionStats(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(successResponse({ volume: 15600, totalFees: 45.2, activeTrades: 8 }));
    } catch (error) {
      next(error);
    }
  }
}
