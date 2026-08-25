import { z } from 'zod';

export const createTransactionSchema = z.object({
  fromAddress: z.string(),
  toAddress: z.string(),
  assetId: z.string().optional(),
  amount: z.number().positive(),
  usdValue: z.number().positive().optional(),
  type: z.enum([
    'MINT',
    'BURN',
    'TRANSFER',
    'SWAP',
    'BUY',
    'SELL',
    'STAKE',
    'UNSTAKE',
    'BRIDGE',
    'ROLE_ASSIGNMENT',
    'ACCESS_APPROVAL',
  ]),
  memo: z.string().optional(),
});

export const updateTransactionStatusSchema = z.object({
  status: z.enum(['SUCCESS', 'PENDING', 'FAILED', 'CANCELLED']),
});

export const transactionQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  network: z.string().optional(),
  fromAddress: z.string().optional(),
  toAddress: z.string().optional(),
  minAmount: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  maxAmount: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  sortBy: z.enum(['timestamp', 'amount', 'usdValue', 'feeEth']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
