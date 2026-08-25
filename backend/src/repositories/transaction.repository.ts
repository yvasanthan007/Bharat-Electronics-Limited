import { PrismaClient, Prisma, Transaction } from '@prisma/client';

export class TransactionRepository {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  async create(data: Prisma.TransactionUncheckedCreateInput): Promise<Transaction> {
    return this.prisma.transaction.create({ data });
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.prisma.transaction.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.TransactionUncheckedUpdateInput): Promise<Transaction> {
    return this.prisma.transaction.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Transaction> {
    return this.prisma.transaction.delete({
      where: { id },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.TransactionWhereInput;
    orderBy?: Prisma.TransactionOrderByWithRelationInput;
  }): Promise<{ data: Transaction[]; totalCount: number }> {
    const { skip, take, where, orderBy } = params;

    const [data, totalCount] = await Promise.all([
      this.prisma.transaction.findMany({
        skip,
        take,
        where,
        orderBy,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return { data, totalCount };
  }

  // Analytics query for transactions
  async getAnalytics(where?: Prisma.TransactionWhereInput) {
    const aggregations = await this.prisma.transaction.aggregate({
      _count: { _all: true },
      _sum: { amount: true, usdValue: true, transactionFee: true },
      _avg: { amount: true, usdValue: true },
      where,
    });

    const statusGroup = await this.prisma.transaction.groupBy({
      by: ['status'],
      _count: true,
      where,
    });

    const typeGroup = await this.prisma.transaction.groupBy({
      by: ['transactionType'],
      _count: true,
      where,
    });

    const networkGroup = await this.prisma.transaction.groupBy({
      by: ['network'],
      _count: true,
      where,
    });

    const assetGroup = await this.prisma.transaction.groupBy({
      by: ['assetSymbol'],
      _count: true,
      orderBy: { _count: { assetSymbol: 'desc' } },
      take: 5,
      where,
    });

    // We can also fetch daily/monthly volume logically here, but simpler is returning raw group by if needed.
    // For now we return base aggregations and let service formatting handle it.
    
    return {
      aggregations,
      statusGroup,
      typeGroup,
      networkGroup,
      assetGroup
    };
  }
}
