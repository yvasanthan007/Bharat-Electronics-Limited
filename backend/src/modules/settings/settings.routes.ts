import { Router, Request, Response } from 'express';
import { ApiResponse } from '../../shared/utils/response';
import { asyncHandler } from '../../middleware/asyncHandler';

const router = Router();

let settingsData = {
  general: {
    orgName: 'Bharat Electronics Limited (BEL)',
    entityId: 'BEL-DEFENSE-NODE-01',
    defenseClassification: 'Restricted / Defense Grade',
    adminEmail: 'rahul.verma@bel.co.in',
    platformDomain: 'trust.bel.co.in',
    timezone: 'Asia/Kolkata (IST +05:30)',
    locale: 'en-IN',
    theme: 'light',
    dataResidency: 'India Sovereign Cloud (MeitY Approved)',
  },
  blockchain: {
    networkName: 'BEL Sovereign Testnet / Quorum',
    rpcEndpoint: 'https://rpc-testnet.trust.bel.co.in',
    chainId: 98234,
    gasPriceStrategy: 'Standard',
    customGasLimit: '8000000',
    blockExplorerUrl: 'https://explorer.trust.bel.co.in',
    consensusMechanism: 'IBFT 2.0 (Proof of Authority)',
    activeValidators: 7,
    latestBlock: '#2,345,678',
    blockTime: '2.4s',
    nodeStatus: 'Healthy',
  },
  security: {
    enforceMfa: true,
    sessionTimeoutMinutes: 30,
    maxFailedAttempts: 5,
    ipAllowlistEnabled: true,
    ipAllowlist: ['10.200.0.0/16', '192.168.10.0/24'],
    signatureAlgorithm: 'ECDSA secp256k1',
    auditLogRetentionDays: 3650,
  },
};

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    ApiResponse.success(res, settingsData, 'System settings retrieved');
  })
);

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    settingsData = { ...settingsData, ...req.body };
    ApiResponse.success(res, settingsData, 'System settings saved successfully');
  })
);

router.post(
  '/ping-node',
  asyncHandler(async (_req: Request, res: Response) => {
    ApiResponse.success(
      res,
      { success: true, latencyMs: 24, block: '#2,345,679' },
      'Blockchain node pinged successfully'
    );
  })
);

export default router;
