import { TransactionRepository } from '../repositories/transaction.repository';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { createTransactionSchema, updateTransactionSchema, transactionQuerySchema, analyticsQuerySchema, exportQuerySchema } from '../types/transaction.types';

export class TransactionService {
  private repository: TransactionRepository;

  constructor(repository: TransactionRepository) {
    this.repository = repository;
  }

  async create(data: z.infer<typeof createTransactionSchema>) {
    return this.repository.create(data);
  }

  async findById(id: string) {
    const tx = await this.repository.findById(id);
    if (!tx) throw new Error('Transaction not found');
    return tx;
  }

  async update(id: string, data: z.infer<typeof updateTransactionSchema>) {
    await this.findById(id); // Check existence
    return this.repository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.repository.delete(id);
  }

  async findMany(query: z.infer<typeof transactionQuerySchema>) {
    const { page, limit, startDate, endDate, walletId, assetSymbol, status, network, transactionType, minAmount, maxAmount, search, sortBy, sortOrder } = query;
    
    const skip = (page - 1) * limit;
    const where: Prisma.TransactionWhereInput = {};

    if (walletId) where.walletId = walletId;
    if (assetSymbol) where.assetSymbol = assetSymbol;
    if (status) where.status = status;
    if (network) where.network = network;
    if (transactionType) where.transactionType = transactionType;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = minAmount;
      if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }

    if (search) {
      where.OR = [
        { transactionHash: { contains: search, mode: 'insensitive' } },
        { assetName: { contains: search, mode: 'insensitive' } },
        { assetSymbol: { contains: search, mode: 'insensitive' } },
        { fromAddress: { contains: search, mode: 'insensitive' } },
        { toAddress: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.TransactionOrderByWithRelationInput = { [sortBy]: sortOrder };

    const { data, totalCount } = await this.repository.findMany({ skip, take: limit, where, orderBy });
    
    return {
      data,
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    };
  }

  async getAnalytics(query: z.infer<typeof analyticsQuerySchema>) {
    const { startDate, endDate, walletId, network } = query;
    const where: Prisma.TransactionWhereInput = {};

    if (walletId) where.walletId = walletId;
    if (network) where.network = network;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const { aggregations, statusGroup, typeGroup, networkGroup, assetGroup } = await this.repository.getAnalytics(where);

    const successfulTransactions = statusGroup.find(s => s.status === 'Confirmed')?._count || 0;
    const pendingTransactions = statusGroup.find(s => s.status === 'Pending')?._count || 0;
    const failedTransactions = statusGroup.find(s => s.status === 'Failed')?._count || 0;

    return {
      totalTransactions: aggregations._count._all,
      totalVolume: aggregations._sum.amount || 0,
      totalUsdVolume: aggregations._sum.usdValue || 0,
      successfulTransactions,
      pendingTransactions,
      failedTransactions,
      totalFeesPaid: aggregations._sum.transactionFee || 0,
      averageTransactionSize: aggregations._avg.amount || 0,
      averageUsdSize: aggregations._avg.usdValue || 0,
      mostUsedAssets: assetGroup.map(a => ({ assetSymbol: a.assetSymbol, count: a._count })),
      networkUsage: networkGroup.map(n => ({ network: n.network, count: n._count })),
      transactionTypesDistribution: typeGroup.map(t => ({ transactionType: t.transactionType, count: t._count })),
    };
  }

  async export(query: z.infer<typeof exportQuerySchema>) {
    // Generate full list without pagination for export
    const fullQuery = { ...query, page: 1, limit: 1000000 };
    const { data } = await this.findMany(fullQuery);
    
    if (query.format === 'csv') {
      const header = ['id', 'transactionHash', 'transactionType', 'assetSymbol', 'amount', 'usdValue', 'status', 'network', 'timestamp'].join(',');
      const rows = data.map(tx => [tx.id, tx.transactionHash, tx.transactionType, tx.assetSymbol, tx.amount, tx.usdValue, tx.status, tx.network, tx.timestamp.toISOString()].join(','));
      return [header, ...rows].join('\n');
    }
    
    return data;
  }
}
