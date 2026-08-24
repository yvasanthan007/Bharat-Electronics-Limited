import { Router, Request, Response } from 'express';
import { dbStore, MockWallet } from '../../database/mockDataStore';
import { ApiResponse } from '../../shared/utils/response';
import { NotFoundError } from '../../shared/errors/AppError';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from '../../middleware/asyncHandler';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    ApiResponse.success(res, dbStore.wallets, 'Connected wallets retrieved');
  })
);

router.get(
  '/:address',
  asyncHandler(async (req: Request, res: Response) => {
    const wallet = dbStore.wallets.find((w) => w.address.toLowerCase() === req.params.address.toLowerCase());
    if (!wallet) {
      throw new NotFoundError(`Wallet ${req.params.address} not found`);
    }
    ApiResponse.success(res, wallet, 'Wallet details retrieved');
  })
);

router.post(
  '/connect',
  asyncHandler(async (req: Request, res: Response) => {
    const { address, label } = req.body;
    const existing = dbStore.wallets.find((w) => w.address.toLowerCase() === address.toLowerCase());
    if (existing) {
      return ApiResponse.success(res, existing, 'Wallet already connected');
    }

    const newWallet: MockWallet = {
      id: `wlt-${uuidv4().substring(0, 8)}`,
      userId: 'usr-admin-01',
      address,
      label: label || 'External Enterprise Signer',
      network: 'BEL Sovereign Testnet',
      chainId: 98234,
      isVerified: true,
      balanceEth: 50.0,
      type: 'EVM_ENTERPRISE',
      createdAt: new Date(),
    };

    dbStore.wallets.push(newWallet);
    return ApiResponse.created(res, newWallet, 'Wallet connected successfully');
  })
);

export default router;
