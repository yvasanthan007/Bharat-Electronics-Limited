import { Router } from 'express';
import { transactionsController } from './transactions.controller';
import { validateRequest } from '../../middleware/validate';
import {
  createTransactionSchema,
  updateTransactionStatusSchema,
  transactionQuerySchema,
} from './transactions.schema';
import { authenticate, authorize } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/asyncHandler';

const router = Router();

router.get('/', validateRequest({ query: transactionQuerySchema }), asyncHandler(transactionsController.listTransactions));
router.get('/summary', asyncHandler(transactionsController.getSummary));
router.get('/fraud-metrics', asyncHandler(transactionsController.getFraudMetrics));
router.get('/:id', asyncHandler(transactionsController.getTransactionById));

router.post(
  '/',
  authenticate,
  validateRequest({ body: createTransactionSchema }),
  asyncHandler(transactionsController.createTransaction)
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(['Administrator', 'Manager']),
  validateRequest({ body: updateTransactionStatusSchema }),
  asyncHandler(transactionsController.updateStatus)
);

export default router;
