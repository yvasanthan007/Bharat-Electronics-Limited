import { dbStore, MockAsset } from '../../database/mockDataStore';
import { NotFoundError } from '../../shared/errors/AppError';
import { CryptoUtil } from '../../shared/utils/crypto';
import { v4 as uuidv4 } from 'uuid';

export class AssetsService {
  public async listAssets(params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    isFavorite?: boolean;
    sortBy?: 'name' | 'marketValueUsd' | 'pnlPercentage' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    let filtered = [...dbStore.assets];

    if (params.category && params.category !== 'All') {
      filtered = filtered.filter((a) => a.category === params.category);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.symbol.toLowerCase().includes(q) ||
          a.contractAddress.toLowerCase().includes(q) ||
          a.tokenId?.toLowerCase().includes(q)
      );
    }

    if (params.isFavorite !== undefined) {
      filtered = filtered.filter((a) => a.isFavorite === params.isFavorite);
    }

    // Sort
    const sortField = params.sortBy || 'marketValueUsd';
    const sortOrder = params.sortOrder || 'desc';

    filtered.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return { assets: paginated, total, page, limit };
  }

  public async getAssetById(id: string) {
    const asset = dbStore.assets.find((a) => a.id === id);
    if (!asset) {
      throw new NotFoundError(`Digital asset with ID ${id} not found`);
    }

    // Related transactions
    const relatedTxs = dbStore.transactions.filter((tx) => tx.assetId === id);

    return {
      ...asset,
      transactions: relatedTxs,
      purchaseHistory: [
        { date: '2026-04-10', price: asset.buyPriceUsd, quantity: asset.quantity, txHash: '0x8f3c...9923' },
      ],
      linkedWallets: ['0x7f82...a3b9'],
      realizedGains: 0,
      unrealizedGains: (asset.currentPriceUsd - asset.buyPriceUsd) * asset.quantity,
    };
  }

  public async getHoldingsSummary() {
    const totalPortfolioValue = dbStore.assets.reduce((sum, a) => sum + a.marketValueUsd, 0);
    const totalHoldings = dbStore.assets.reduce((sum, a) => sum + a.quantity, 0);

    const sortedByPnl = [...dbStore.assets].sort((a, b) => b.pnlPercentage - a.pnlPercentage);
    const bestPerformer = sortedByPnl[0]
      ? `${sortedByPnl[0].symbol} (+${sortedByPnl[0].pnlPercentage}%)`
      : 'None';
    const worstPerformer = sortedByPnl[sortedByPnl.length - 1]
      ? `${sortedByPnl[sortedByPnl.length - 1].symbol} (${sortedByPnl[sortedByPnl.length - 1].pnlPercentage}%)`
      : 'None';

    return {
      totalPortfolioValue,
      totalHoldings,
      bestPerformer,
      worstPerformer,
      dayChangePercentage: 4.82,
      assetsCount: dbStore.assets.length,
    };
  }

  public async getAllocation() {
    const totalValue = dbStore.assets.reduce((sum, a) => sum + a.marketValueUsd, 0) || 1;

    const categoriesMap: Record<string, { value: number; count: number; color: string }> = {
      TOKENIZED_DEFENSE_HARDWARE: { value: 0, count: 0, color: '#2563eb' },
      STABLECOIN: { value: 0, count: 0, color: '#10b981' },
      CRYPTO: { value: 0, count: 0, color: '#8b5cf6' },
      NFT_CERTIFICATE: { value: 0, count: 0, color: '#f59e0b' },
      TOKENIZED_SECURITIES: { value: 0, count: 0, color: '#ec4899' },
    };

    dbStore.assets.forEach((asset) => {
      if (!categoriesMap[asset.category]) {
        categoriesMap[asset.category] = { value: 0, count: 0, color: '#64748b' };
      }
      categoriesMap[asset.category].value += asset.marketValueUsd;
      categoriesMap[asset.category].count += asset.quantity;
    });

    const allocation = Object.entries(categoriesMap)
      .filter(([_, data]) => data.value > 0)
      .map(([cat, data]) => ({
        category: cat,
        value: data.value,
        holdings: data.count,
        percentage: Math.round((data.value / totalValue) * 100),
        color: data.color,
      }));

    return { totalValue, allocation };
  }

  public async getPerformance(period = '30D') {
    // Generate realistic periodic trendline data
    const periodsMap: Record<string, number> = {
      '24H': 24,
      '7D': 7,
      '30D': 30,
      '90D': 90,
      '1Y': 12,
    };

    const count = periodsMap[period] || 30;
    const points = [];
    let baseValue = 320000;

    for (let i = count; i >= 0; i--) {
      baseValue += (Math.random() - 0.45) * 4000;
      points.push({
        timestamp: new Date(Date.now() - i * (period === '24H' ? 3600000 : 86400000)).toISOString().split('T')[0],
        value: Math.round(baseValue),
        pnlChange: parseFloat(((baseValue - 320000) / 3200).toFixed(2)),
      });
    }

    return { period, dataPoints: points };
  }

  public async mintAsset(data: any, ownerId = 'usr-admin-01') {
    const marketValueUsd = data.quantity * data.currentPriceUsd;
    const pnlPercentage = parseFloat(
      (((data.currentPriceUsd - data.buyPriceUsd) / data.buyPriceUsd) * 100).toFixed(2)
    );

    const newAsset: MockAsset = {
      id: `ast-${uuidv4().substring(0, 8)}`,
      name: data.name,
      symbol: data.symbol,
      category: data.category,
      tokenId: data.tokenId || `#${Math.floor(1000 + Math.random() * 9000)}`,
      contractAddress: data.contractAddress || `0x${CryptoUtil.generateRandomToken(20)}`,
      ownerId,
      quantity: data.quantity,
      buyPriceUsd: data.buyPriceUsd,
      currentPriceUsd: data.currentPriceUsd,
      allocationPercentage: 15.0,
      pnlPercentage,
      marketValueUsd,
      image: data.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200',
      isFavorite: false,
      blockNumber: 2345681,
      createdAt: new Date(),
    };

    dbStore.assets.unshift(newAsset);

    // Create corresponding on-chain transaction
    dbStore.transactions.unshift({
      id: `tx-${uuidv4().substring(0, 8)}`,
      hash: `0x${CryptoUtil.generateRandomToken(24)}`,
      blockNumber: 2345681,
      fromAddress: '0x0000000000000000000000000000000000000000',
      toAddress: '0x7f82c4412f9e110b77c5d41a99b21a8d76e0a3b9',
      assetId: newAsset.id,
      amount: newAsset.quantity,
      usdValue: newAsset.marketValueUsd,
      feeEth: 0.00042,
      gasUsed: 42000,
      gasPriceGwei: 20,
      type: 'MINT',
      status: 'SUCCESS',
      network: 'BEL Sovereign Testnet',
      timestamp: new Date(),
      memo: `Minted asset ${newAsset.name} (${newAsset.tokenId})`,
    });

    return newAsset;
  }

  public async toggleFavorite(id: string) {
    const asset = dbStore.assets.find((a) => a.id === id);
    if (!asset) {
      throw new NotFoundError(`Asset with ID ${id} not found`);
    }
    asset.isFavorite = !asset.isFavorite;
    return { id: asset.id, isFavorite: asset.isFavorite };
  }

  public async deleteAsset(id: string) {
    const idx = dbStore.assets.findIndex((a) => a.id === id);
    if (idx === -1) {
      throw new NotFoundError(`Asset with ID ${id} not found`);
    }
    dbStore.assets.splice(idx, 1);
    return { deleted: true, id };
  }
}

export const assetsService = new AssetsService();
