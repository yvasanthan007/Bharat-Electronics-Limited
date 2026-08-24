import { Router } from 'express';
import { WalletsController } from './wallets.controller';

const router = Router();
const ctrl = new WalletsController();

router.get('/', ctrl.getMyWallets);
router.get('/:id', ctrl.getWalletById);

export default router;
