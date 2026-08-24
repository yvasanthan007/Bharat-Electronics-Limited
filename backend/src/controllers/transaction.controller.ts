import { Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/transaction.service';
import { createTransactionSchema, updateTransactionSchema, transactionQuerySchema, analyticsQuerySchema, exportQuerySchema } from '../types/transaction.types';

export class TransactionController {
  private service: TransactionService;

  constructor(service: TransactionService) {
    this.service = service;
  }

  getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = transactionQuerySchema.parse(req.query);
      const result = await this.service.findMany(query);
      res.status(200).json({ success: true, message: 'Transactions fetched successfully', data: result });
    } catch (error: any) {
      next(error);
    }
  };

  getTransactionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.findById(req.params.id as string);
      res.status(200).json({ success: true, message: 'Transaction fetched successfully', data: result });
    } catch (error: any) {
      next(error);
    }
  };

  createTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = createTransactionSchema.parse(req.body);
      const result = await this.service.create(validation);
      res.status(201).json({ success: true, message: 'Transaction created successfully', data: result });
    } catch (error: any) {
      next(error);
    }
  };

  updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = updateTransactionSchema.parse(req.body);
      const result = await this.service.update(req.params.id as string, validation);
      res.status(200).json({ success: true, message: 'Transaction updated successfully', data: result });
    } catch (error: any) {
      next(error);
    }
  };

  deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.delete(req.params.id as string);
      res.status(200).json({ success: true, message: 'Transaction deleted successfully', data: result });
    } catch (error: any) {
      next(error);
    }
  };

  getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = analyticsQuerySchema.parse(req.query);
      const result = await this.service.getAnalytics(query);
      res.status(200).json({ success: true, message: 'Analytics fetched successfully', data: result });
    } catch (error: any) {
      next(error);
    }
  };

  exportTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = exportQuerySchema.parse(req.query);
      const result = await this.service.export(query);
      
      if (query.format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
        return res.status(200).send(result);
      }
      
      res.status(200).json({ success: true, message: 'Export successful', data: result });
    } catch (error: any) {
      next(error);
    }
  };
}
