import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { TransactionService } from '../services/transaction.service';
import { TransactionRepository } from '../repositories/transaction.repository';
import { prisma } from '../database';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Instantiate the layers
const repository = new TransactionRepository(prisma);
const service = new TransactionService(repository);
const controller = new TransactionController(service);

// Protect all routes
router.use(authMiddleware);

// Routes
router.get('/analytics', controller.getAnalytics);
router.get('/export', controller.exportTransactions);
router.get('/', controller.getTransactions);
router.get('/:id', controller.getTransactionById);
router.post('/', controller.createTransaction);
router.put('/:id', controller.updateTransaction);
router.delete('/:id', controller.deleteTransaction);

export default router;
