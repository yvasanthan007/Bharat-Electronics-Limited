export interface AssetActivity {
  id: string;
  type: 'Bought' | 'Sold' | 'Received' | 'Transferred' | 'Swapped';
  asset: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  timestamp: string;
  wallet: string;
}

export interface Asset {
  id: string;
  ticker: string;
  name: string;
  logo: string;
  quantity: number;
  currentPrice: number;
  change24h: number;
  marketValue: number;
  allocation: number;
  pnl: number;
  history: Array<{ price: number; timestamp: string }>;
  purchaseHistory: Array<{ date: string; amount: number; price: number }>;
  averageBuyPrice: number;
  linkedWallets: string[];
  realizedGains: number;
  unrealizedGains: number;
  transactionCount: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalHoldings: number;
  bestPerformer: { ticker: string; change: number };
  worstPerformer: { ticker: string; change: number };
}

export const getAssets = async (): Promise<Asset[]> => {
  return [
    {
      id: '1',
      ticker: 'BTC',
      name: 'Bitcoin',
      logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg',
      quantity: 1.25,
      currentPrice: 65432.1,
      change24h: 2.4,
      marketValue: 81790.12,
      allocation: 45.2,
      pnl: 12500,
      history: Array.from({ length: 30 }).map((_, i) => ({
        price: 60000 + Math.random() * 10000,
        timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
      })),
      purchaseHistory: [
        { date: '2023-01-15', amount: 1.0, price: 20000 },
        { date: '2023-11-20', amount: 0.25, price: 35000 },
      ],
      averageBuyPrice: 23000,
      linkedWallets: ['0x1a2b...3c4d', 'bc1q...xyza'],
      realizedGains: 5000,
      unrealizedGains: 53102,
      transactionCount: 42,
    },
    {
      id: '2',
      ticker: 'ETH',
      name: 'Ethereum',
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
      quantity: 15.5,
      currentPrice: 3500.5,
      change24h: -1.2,
      marketValue: 54257.75,
      allocation: 30.0,
      pnl: 18000,
      history: Array.from({ length: 30 }).map((_, i) => ({
        price: 3000 + Math.random() * 800,
        timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
      })),
      purchaseHistory: [
        { date: '2022-06-10', amount: 10.0, price: 1200 },
        { date: '2024-02-05', amount: 5.5, price: 2400 },
      ],
      averageBuyPrice: 1625,
      linkedWallets: ['0x1a2b...3c4d'],
      realizedGains: 2000,
      unrealizedGains: 29070,
      transactionCount: 128,
    },
    {
      id: '3',
      ticker: 'SOL',
      name: 'Solana',
      logo: 'https://cryptologos.cc/logos/solana-sol-logo.svg',
      quantity: 450,
      currentPrice: 145.2,
      change24h: 5.6,
      marketValue: 65340,
      allocation: 15.8,
      pnl: 25000,
      history: Array.from({ length: 30 }).map((_, i) => ({
        price: 100 + Math.random() * 60,
        timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
      })),
      purchaseHistory: [
        { date: '2023-09-01', amount: 450, price: 22 },
      ],
      averageBuyPrice: 22,
      linkedWallets: ['ExYK...9bFa'],
      realizedGains: 0,
      unrealizedGains: 55440,
      transactionCount: 15,
    },
    {
      id: '4',
      ticker: 'USDC',
      name: 'USD Coin',
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg',
      quantity: 15000,
      currentPrice: 1.0,
      change24h: 0.01,
      marketValue: 15000,
      allocation: 9.0,
      pnl: 0,
      history: Array.from({ length: 30 }).map((_, i) => ({
        price: 0.999 + Math.random() * 0.002,
        timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
      })),
      purchaseHistory: [
        { date: '2024-01-01', amount: 15000, price: 1.0 },
      ],
      averageBuyPrice: 1.0,
      linkedWallets: ['0x1a2b...3c4d'],
      realizedGains: 0,
      unrealizedGains: 0,
      transactionCount: 8,
    }
  ];
};

export const getPortfolioSummary = async (): Promise<PortfolioSummary> => {
  return {
    totalValue: 216387.87,
    totalHoldings: 12,
    bestPerformer: { ticker: 'SOL', change: 15.4 },
    worstPerformer: { ticker: 'DOT', change: -3.2 },
  };
};

export const getActivities = async (): Promise<AssetActivity[]> => {
  return [
    {
      id: 'a1',
      type: 'Bought',
      asset: 'BTC',
      amount: 0.05,
      status: 'Completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      wallet: 'Ledger Nano X',
    },
    {
      id: 'a2',
      type: 'Swapped',
      asset: 'ETH',
      amount: 1.5,
      status: 'Completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      wallet: 'MetaMask',
    },
    {
      id: 'a3',
      type: 'Received',
      asset: 'USDC',
      amount: 500,
      status: 'Pending',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      wallet: 'Phantom',
    }
  ];
};
