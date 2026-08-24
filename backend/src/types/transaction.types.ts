import { z } from 'zod';

export const transactionStatusEnum = z.enum(['Pending', 'Processing', 'Confirmed', 'Failed', 'Cancelled']);
export const transactionTypeEnum = z.enum(['Send', 'Receive', 'Swap', 'Stake', 'Unstake', 'Bridge', 'Mint', 'Burn', 'Deposit', 'Withdraw']);

export const createTransactionSchema = z.object({
  transactionHash: z.string().min(1, 'Transaction hash is required'),
  transactionType: transactionTypeEnum,
  assetSymbol: z.string().min(1),
  assetName: z.string().min(1),
  walletId: z.string().uuid(),
  network: z.string().min(1),
  fromAddress: z.string().min(1),
  toAddress: z.string().min(1),
  amount: z.number().positive(),
  usdValue: z.number().nonnegative(),
  transactionFee: z.number().nonnegative(),
  gasUsed: z.number().nonnegative().optional(),
  gasPrice: z.number().nonnegative().optional(),
  status: transactionStatusEnum,
  confirmations: z.number().int().nonnegative().optional(),
  blockNumber: z.number().int().nonnegative().optional(),
  timestamp: z.string().datetime().or(z.date()),
  memo: z.string().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionQuerySchema = z.object({
  page: z.string().optional().transform(val => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform(val => (val ? parseInt(val) : 10)),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  walletId: z.string().optional(),
  assetSymbol: z.string().optional(),
  status: z.string().optional(),
  network: z.string().optional(),
  transactionType: z.string().optional(),
  minAmount: z.string().optional().transform(val => (val ? parseFloat(val) : undefined)),
  maxAmount: z.string().optional().transform(val => (val ? parseFloat(val) : undefined)),
  search: z.string().optional(),
  sortBy: z.enum(['timestamp', 'amount', 'usdValue', 'status', 'network']).optional().default('timestamp'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const analyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  walletId: z.string().optional(),
  network: z.string().optional(),
});

export const exportQuerySchema = transactionQuerySchema.extend({
  format: z.enum(['csv', 'json']).optional().default('csv'),
});
