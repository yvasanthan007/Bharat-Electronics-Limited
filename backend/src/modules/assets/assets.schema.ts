import { z } from 'zod';

export const createAssetSchema = z.object({
  name: z.string().min(2, 'Asset name is required'),
  symbol: z.string().min(2, 'Asset symbol is required'),
  category: z.enum([
    'CRYPTO',
    'STABLECOIN',
    'NFT_CERTIFICATE',
    'TOKENIZED_DEFENSE_HARDWARE',
    'TOKENIZED_SECURITIES',
  ]),
  tokenId: z.string().optional(),
  contractAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum contract address format').optional(),
  quantity: z.number().positive(),
  buyPriceUsd: z.number().positive(),
  currentPriceUsd: z.number().positive(),
  image: z.string().url().optional(),
});

export const updateAssetSchema = createAssetSchema.partial();

export const assetQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  category: z.string().optional(),
  search: z.string().optional(),
  isFavorite: z.string().optional().transform((val) => val === 'true'),
  sortBy: z.enum(['name', 'marketValueUsd', 'pnlPercentage', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
