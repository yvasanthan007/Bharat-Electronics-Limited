import { Request, Response } from 'express';
import { transactionsService } from './transactions.service';
import { ApiResponse } from '../../shared/utils/response';

export class TransactionsController {
  public listTransactions = async (req: Request, res: Response): Promise<void> => {
    const { transactions, total, page, limit } = await transactionsService.listTransactions(req.query);
    ApiResponse.paginated(res, transactions, page, limit, total, 'Transactions retrieved successfully');
  };

  public getSummary = async (_req: Request, res: Response): Promise<void> => {
    const summary = await transactionsService.getSummaryStats();
    ApiResponse.success(res, summary, 'Transaction summary statistics retrieved');
  };

  public getFraudMetrics = async (_req: Request, res: Response): Promise<void> => {
    const metrics = await transactionsService.getFraudMetrics();
    ApiResponse.success(res, metrics, 'Fraud detection metrics retrieved');
  };

  public getTransactionById = async (req: Request, res: Response): Promise<void> => {
    const tx = await transactionsService.getTransactionById(req.params.id);
    ApiResponse.success(res, tx, 'Transaction details retrieved');
  };

  public createTransaction = async (req: Request, res: Response): Promise<void> => {
    const tx = await transactionsService.createTransaction(req.body);
    ApiResponse.created(res, tx, 'Transaction broadcasted successfully');
  };

  public updateStatus = async (req: Request, res: Response): Promise<void> => {
    const tx = await transactionsService.updateStatus(req.params.id, req.body.status);
    ApiResponse.success(res, tx, 'Transaction status updated');
  };
}

export const transactionsController = new TransactionsController();
