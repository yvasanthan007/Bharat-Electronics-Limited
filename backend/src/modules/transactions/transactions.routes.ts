import { Router } from 'express';
import { TransactionsController } from './transactions.controller';

const router = Router();
const txController = new TransactionsController();

router.get('/', txController.getAllTransactions);
router.get('/stats', txController.getTransactionStats);

export default router;
