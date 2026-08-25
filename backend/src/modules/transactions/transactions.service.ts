import { dbStore, MockTransaction } from '../../database/mockDataStore';
import { NotFoundError } from '../../shared/errors/AppError';
import { CryptoUtil } from '../../shared/utils/crypto';
import { v4 as uuidv4 } from 'uuid';

export class TransactionsService {
  public async listTransactions(params: any) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    let filtered = [...dbStore.transactions];

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.hash.toLowerCase().includes(q) ||
          t.fromAddress.toLowerCase().includes(q) ||
          t.toAddress.toLowerCase().includes(q) ||
          t.memo?.toLowerCase().includes(q)
      );
    }

    if (params.type && params.type !== 'All') {
      filtered = filtered.filter((t) => t.type === params.type);
    }

    if (params.status && params.status !== 'All') {
      filtered = filtered.filter((t) => t.status === params.status);
    }

    if (params.network && params.network !== 'All') {
      filtered = filtered.filter((t) => t.network === params.network);
    }

    if (params.minAmount !== undefined) {
      filtered = filtered.filter((t) => t.amount >= params.minAmount);
    }

    if (params.maxAmount !== undefined) {
      filtered = filtered.filter((t) => t.amount <= params.maxAmount);
    }

    const sortField = params.sortBy || 'timestamp';
    const sortOrder = params.sortOrder || 'desc';

    filtered.sort((a: any, b: any) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (sortField === 'timestamp') {
        const timeA = new Date(valA).getTime();
        const timeB = new Date(valB).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return { transactions: paginated, total, page, limit };
  }

  public async getTransactionById(idOrHash: string) {
    const tx = dbStore.transactions.find((t) => t.id === idOrHash || t.hash === idOrHash);
    if (!tx) {
      throw new NotFoundError(`Transaction ${idOrHash} not found`);
    }
    return {
      ...tx,
      confirmations: 128,
      explorerUrl: `https://explorer.trust.bel.co.in/tx/${tx.hash}`,
      rawJson: {
        blockHash: '0x88fc992019481203948120394812039481203948120394812039481203948120',
        transactionIndex: 4,
        nonce: 42,
        input: '0xa9059cbb000000000000000000000000',
      },
    };
  }

  public async createTransaction(data: any) {
    const newTx: MockTransaction = {
      id: `tx-${uuidv4().substring(0, 8)}`,
      hash: `0x${CryptoUtil.generateRandomToken(24)}`,
      blockNumber: 2345682,
      fromAddress: data.fromAddress,
      toAddress: data.toAddress,
      assetId: data.assetId,
      amount: data.amount,
      usdValue: data.usdValue || data.amount * 100,
      feeEth: 0.00021,
      gasUsed: 21000,
      gasPriceGwei: 20,
      type: data.type,
      status: 'SUCCESS',
      network: 'BEL Sovereign Testnet',
      timestamp: new Date(),
      memo: data.memo || 'On-chain transaction processed via BEL Gateway',
    };

    dbStore.transactions.unshift(newTx);
    return newTx;
  }

  public async updateStatus(idOrHash: string, status: string) {
    const tx = dbStore.transactions.find((t) => t.id === idOrHash || t.hash === idOrHash);
    if (!tx) {
      throw new NotFoundError(`Transaction ${idOrHash} not found`);
    }
    tx.status = status;
    return tx;
  }

  public async getSummaryStats() {
    const totalTransactions = dbStore.transactions.length + 2853;
    const successful = Math.round(totalTransactions * 0.985);
    const pending = 12;
    const failed = totalTransactions - successful - pending;
    const totalVolume = '$4,850,200';
    const totalFeesPaid = '1.84 ETH (~$5,520)';

    return {
      totalTransactions,
      successful,
      pending,
      failed,
      volume: totalVolume,
      feesPaid: totalFeesPaid,
    };
  }

  public async getFraudMetrics() {
    return {
      overallRiskScore: 'Low (2.4/100)',
      suspiciousWalletsFlagged: 0,
      largeWithdrawalAlerts: 1,
      newAddressesInteracted: 4,
      approvalThresholdAlerts: 0,
      securityRecommendations: [
        'Enforce dual-sign authorization on withdrawals exceeding 100,000 bUSD.',
        'Rotate validator hot-wallet keys every 90 days.',
      ],
    };
  }
}

export const transactionsService = new TransactionsService();
