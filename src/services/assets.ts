export type Currency = 'USD' | 'INR';

export const USD_TO_INR_RATE = 83.50;

export type DefenseCategory = 
  | 'Radar & Sensors' 
  | 'Avionics & EW' 
  | 'Comm & Crypto' 
  | 'Sovereign Tokens' 
  | 'Defense Hardware';

export interface AssetActivity {
  id: string;
  type: 'Minted' | 'Transferred' | 'Bought' | 'Sold' | 'Received' | 'Swapped';
  asset: string;
  ticker: string;
  amount: number;
  unitPriceUsd: number;
  status: 'Completed' | 'Pending' | 'Failed';
  timestamp: string;
  wallet: string;
  txHash: string;
  blockNumber: number;
  gasFee: string;
}

export interface Asset {
  id: string;
  ticker: string;
  name: string;
  category: DefenseCategory;
  serialNumber: string;
  tokenStandard: 'ERC-721' | 'ERC-1155' | 'ERC-20';
  contractAddress: string;
  logo: string;
  quantity: number;
  currentPrice: number; // in USD
  change24h: number;
  marketValue: number; // in USD
  allocation: number;
  pnl: number;
  history: Array<{ price: number; timestamp: string }>;
  purchaseHistory: Array<{ date: string; amount: number; price: number }>;
  averageBuyPrice: number;
  linkedWallets: string[];
  realizedGains: number;
  unrealizedGains: number;
  transactionCount: number;
  isFavorite?: boolean;
  defenseVerificationHash?: string;
}

export interface PortfolioSummary {
  totalValue: number; // in USD
  totalHoldings: number;
  activeTokensCount: number;
  bestPerformer: { ticker: string; name: string; change: number };
  worstPerformer: { ticker: string; name: string; change: number };
  netYield24h: number;
}

export function formatCurrency(
  amountUsd: number,
  currency: Currency = 'USD',
  compact: boolean = false
): string {
  const value = currency === 'INR' ? amountUsd * USD_TO_INR_RATE : amountUsd;
  const symbol = currency === 'INR' ? '₹' : '$';

  if (compact) {
    if (currency === 'INR') {
      if (Math.abs(value) >= 10000000) {
        return `${symbol}${(value / 10000000).toFixed(2)} Cr`;
      }
      if (Math.abs(value) >= 100000) {
        return `${symbol}${(value / 100000).toFixed(2)} L`;
      }
      if (Math.abs(value) >= 1000) {
        return `${symbol}${(value / 1000).toFixed(1)}k`;
      }
    } else {
      if (Math.abs(value) >= 1000000) {
        return `${symbol}${(value / 1000000).toFixed(2)}M`;
      }
      if (Math.abs(value) >= 1000) {
        return `${symbol}${(value / 1000).toFixed(1)}k`;
      }
    }
  }

  if (currency === 'INR') {
    return `${symbol}${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `${symbol}${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function convertToUsd(amount: number, fromCurrency: Currency): number {
  if (fromCurrency === 'INR') {
    return amount / USD_TO_INR_RATE;
  }
  return amount;
}

export function convertFromUsd(amountUsd: number, toCurrency: Currency): number {
  if (toCurrency === 'INR') {
    return amountUsd * USD_TO_INR_RATE;
  }
  return amountUsd;
}

// Initial Authentic BEL Tokenized Defense Hardware Assets
const INITIAL_BEL_ASSETS: Asset[] = [
  {
    id: 'bel-ast-01',
    ticker: 'BEL-AFCR-04',
    name: 'BEL Akash Fire Control Radar Mk-IV',
    category: 'Radar & Sensors',
    serialNumber: 'BEL-BLR-AFCR-2026-089',
    tokenStandard: 'ERC-721',
    contractAddress: '0x8f3c4e9b21a8d76e053a992bc4412f9e110b77c5',
    logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=200&auto=format&fit=crop&q=80',
    quantity: 3,
    currentPrice: 185000, // $185,000 (~ ₹1.54 Cr)
    change24h: 4.8,
    marketValue: 555000,
    allocation: 32.5,
    pnl: 45000,
    history: Array.from({ length: 30 }).map((_, i) => ({
      price: 170000 + Math.sin(i * 0.3) * 12000 + i * 500,
      timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
    })),
    purchaseHistory: [
      { date: '2025-06-15', amount: 2, price: 170000 },
      { date: '2026-01-20', amount: 1, price: 180000 },
    ],
    averageBuyPrice: 173333,
    linkedWallets: ['0x33b8...1023 (Radar Vault)', '0x88f1...99a2 (IAF Node)'],
    realizedGains: 12000,
    unrealizedGains: 35000,
    transactionCount: 48,
    isFavorite: true,
    defenseVerificationHash: '0x9a8f3b...4c1e7a',
  },
  {
    id: 'bel-ast-02',
    ticker: 'BEL-CSR-MK3',
    name: 'BEL Coastal Surveillance Radar Mk-III',
    category: 'Radar & Sensors',
    serialNumber: 'BEL-HYD-CSR3-2026-112',
    tokenStandard: 'ERC-721',
    contractAddress: '0x99a014bcfe8192305a4d91280bce491028347102',
    logo: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=200&auto=format&fit=crop&q=80',
    quantity: 4,
    currentPrice: 96000, // $96,000 (~ ₹80.1 Lakhs)
    change24h: -1.4,
    marketValue: 384000,
    allocation: 22.4,
    pnl: 28000,
    history: Array.from({ length: 30 }).map((_, i) => ({
      price: 90000 + Math.cos(i * 0.4) * 6000 + i * 200,
      timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
    })),
    purchaseHistory: [
      { date: '2025-08-10', amount: 4, price: 89000 },
    ],
    averageBuyPrice: 89000,
    linkedWallets: ['0x71a9...c4b2 (Coast Guard Hub)'],
    realizedGains: 8000,
    unrealizedGains: 28000,
    transactionCount: 34,
    isFavorite: true,
    defenseVerificationHash: '0x4f12d8...9e03bb',
  },
  {
    id: 'bel-ast-03',
    ticker: 'BEL-SDR-TAC',
    name: 'BEL Tactical Software Defined Radio Suite',
    category: 'Comm & Crypto',
    serialNumber: 'BEL-KOT-SDR-2026-441',
    tokenStandard: 'ERC-1155',
    contractAddress: '0x4b78912eac781934bc00827361abce9920194832',
    logo: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80',
    quantity: 12,
    currentPrice: 28500, // $28,500 (~ ₹23.8 Lakhs)
    change24h: 7.2,
    marketValue: 342000,
    allocation: 20.0,
    pnl: 54000,
    history: Array.from({ length: 30 }).map((_, i) => ({
      price: 24000 + Math.sin(i * 0.5) * 3000 + i * 150,
      timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
    })),
    purchaseHistory: [
      { date: '2025-11-04', amount: 12, price: 24000 },
    ],
    averageBuyPrice: 24000,
    linkedWallets: ['0x44a1...99ef (Army Signal Corps)'],
    realizedGains: 15000,
    unrealizedGains: 54000,
    transactionCount: 62,
    isFavorite: false,
    defenseVerificationHash: '0x7e29bb...33c091',
  },
  {
    id: 'bel-ast-04',
    ticker: 'BEL-EWS-SAM',
    name: 'BEL Samyukta Electronic Warfare Pod NFT',
    category: 'Avionics & EW',
    serialNumber: 'BEL-GZB-EWS-2026-033',
    tokenStandard: 'ERC-721',
    contractAddress: '0x12a994ef88210bc93481273941bca90823412034',
    logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&auto=format&fit=crop&q=80',
    quantity: 2,
    currentPrice: 125000, // $125,000 (~ ₹1.04 Cr)
    change24h: 3.1,
    marketValue: 250000,
    allocation: 14.6,
    pnl: 20000,
    history: Array.from({ length: 30 }).map((_, i) => ({
      price: 115000 + Math.cos(i * 0.3) * 8000 + i * 300,
      timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
    })),
    purchaseHistory: [
      { date: '2026-01-12', amount: 2, price: 115000 },
    ],
    averageBuyPrice: 115000,
    linkedWallets: ['0x99ce...1092 (DRDO Electronic Vault)'],
    realizedGains: 0,
    unrealizedGains: 20000,
    transactionCount: 19,
    isFavorite: false,
    defenseVerificationHash: '0x2b88aa...1f9940',
  },
  {
    id: 'bel-ast-05',
    ticker: 'bINR',
    name: 'BEL Sovereign Digital Rupee Trust Token',
    category: 'Sovereign Tokens',
    serialNumber: 'BEL-SOV-STABLE-2026',
    tokenStandard: 'ERC-20',
    contractAddress: '0x1a72b94dc83f120e8a7199c08d3e210fa65e9b81',
    logo: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=200&auto=format&fit=crop&q=80',
    quantity: 150000,
    currentPrice: 1.0, // 1 USD equivalent = 1 bUSD / pegged liquidity
    change24h: 0.05,
    marketValue: 150000,
    allocation: 8.8,
    pnl: 0,
    history: Array.from({ length: 30 }).map((_, i) => ({
      price: 1.0 + (Math.sin(i) * 0.001),
      timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
    })),
    purchaseHistory: [
      { date: '2026-02-01', amount: 150000, price: 1.0 },
    ],
    averageBuyPrice: 1.0,
    linkedWallets: ['0x1123...88bb (Treasury Liquidity Reserve)'],
    realizedGains: 3200,
    unrealizedGains: 0,
    transactionCount: 115,
    isFavorite: true,
    defenseVerificationHash: '0x8811aa...7733cc',
  },
  {
    id: 'bel-ast-06',
    ticker: 'BEL-QKD-01',
    name: 'BEL Quantum Key Distribution Crypto Module',
    category: 'Comm & Crypto',
    serialNumber: 'BEL-PUN-QKD-2026-007',
    tokenStandard: 'ERC-721',
    contractAddress: '0x77ba9124018293ecba1092837401928301928371',
    logo: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&auto=format&fit=crop&q=80',
    quantity: 1,
    currentPrice: 75000, // $75,000 (~ ₹62.6 Lakhs)
    change24h: 9.4,
    marketValue: 75000,
    allocation: 4.4,
    pnl: 15000,
    history: Array.from({ length: 30 }).map((_, i) => ({
      price: 60000 + Math.sin(i * 0.4) * 10000 + i * 400,
      timestamp: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
    })),
    purchaseHistory: [
      { date: '2026-03-01', amount: 1, price: 60000 },
    ],
    averageBuyPrice: 60000,
    linkedWallets: ['0x55dc...3319 (Strategic Cyber Command)'],
    realizedGains: 0,
    unrealizedGains: 15000,
    transactionCount: 22,
    isFavorite: false,
    defenseVerificationHash: '0x55aa99...2211ee',
  }
];

const INITIAL_ACTIVITIES: AssetActivity[] = [
  {
    id: 'act-01',
    type: 'Minted',
    asset: 'BEL Akash Fire Control Radar Mk-IV',
    ticker: 'BEL-AFCR-04',
    amount: 1,
    unitPriceUsd: 185000,
    status: 'Completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18m ago
    wallet: '0x33b8...1023 (Radar Vault)',
    txHash: '0x7a91b...c401',
    blockNumber: 4892104,
    gasFee: '0.0034 ETH',
  },
  {
    id: 'act-02',
    type: 'Transferred',
    asset: 'BEL Tactical Software Defined Radio Suite',
    ticker: 'BEL-SDR-TAC',
    amount: 4,
    unitPriceUsd: 28500,
    status: 'Completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(), // 1h 15m ago
    wallet: '0x44a1...99ef (Army Signal Corps)',
    txHash: '0x3f82a...91ee',
    blockNumber: 4892019,
    gasFee: '0.0028 ETH',
  },
  {
    id: 'act-03',
    type: 'Received',
    asset: 'BEL Sovereign Digital Rupee Trust Token',
    ticker: 'bINR',
    amount: 50000,
    unitPriceUsd: 1.0,
    status: 'Completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4h ago
    wallet: '0x1123...88bb (Treasury Liquidity)',
    txHash: '0x5c091...88ab',
    blockNumber: 4891880,
    gasFee: '0.0019 ETH',
  },
  {
    id: 'act-04',
    type: 'Swapped',
    asset: 'BEL Coastal Surveillance Radar Mk-III',
    ticker: 'BEL-CSR-MK3',
    amount: 1,
    unitPriceUsd: 96000,
    status: 'Completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // 14h ago
    wallet: '0x71a9...c4b2 (Coast Guard Hub)',
    txHash: '0x88b02...11cd',
    blockNumber: 4891340,
    gasFee: '0.0041 ETH',
  },
  {
    id: 'act-05',
    type: 'Bought',
    asset: 'BEL Quantum Key Distribution Crypto Module',
    ticker: 'BEL-QKD-01',
    amount: 1,
    unitPriceUsd: 75000,
    status: 'Completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // 1d ago
    wallet: '0x55dc...3319 (Strategic Cyber Command)',
    txHash: '0x992fa...44ef',
    blockNumber: 4890422,
    gasFee: '0.0039 ETH',
  },
  {
    id: 'act-06',
    type: 'Transferred',
    asset: 'BEL Samyukta Electronic Warfare Pod NFT',
    ticker: 'BEL-EWS-SAM',
    amount: 1,
    unitPriceUsd: 125000,
    status: 'Pending',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(), // 1.7d ago
    wallet: '0x99ce...1092 (DRDO Electronic Vault)',
    txHash: '0x114fa...8801',
    blockNumber: 4889812,
    gasFee: '0.0031 ETH',
  },
  {
    id: 'act-07',
    type: 'Sold',
    asset: 'BEL Tactical Software Defined Radio Suite',
    ticker: 'BEL-SDR-TAC',
    amount: 2,
    unitPriceUsd: 28500,
    status: 'Completed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 68).toISOString(), // 2.8d ago
    wallet: '0x44a1...99ef (Army Signal Corps)',
    txHash: '0x229aa...7710',
    blockNumber: 4888710,
    gasFee: '0.0025 ETH',
  }
];

const STORAGE_KEYS = {
  ASSETS: 'bel_digital_assets_data_v2',
  ACTIVITIES: 'bel_digital_activities_data_v2',
  WATCHLIST: 'bel_digital_watchlist_ids_v2',
  CURRENCY: 'bel_digital_active_currency_v2'
};

export const getAssets = async (): Promise<Asset[]> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ASSETS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading saved assets from storage", e);
  }
  return INITIAL_BEL_ASSETS;
};

export const saveAssets = (assets: Asset[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
  } catch (e) {
    console.error("Error saving assets", e);
  }
};

export const getActivities = async (): Promise<AssetActivity[]> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading activities from storage", e);
  }
  return INITIAL_ACTIVITIES;
};

export const saveActivities = (activities: AssetActivity[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (e) {
    console.error("Error saving activities", e);
  }
};

export const getPortfolioSummary = async (assetsList?: Asset[]): Promise<PortfolioSummary> => {
  const list = assetsList || await getAssets();
  const totalValue = list.reduce((sum, item) => sum + item.marketValue, 0);
  const totalHoldings = list.reduce((sum, item) => sum + item.quantity, 0);
  const activeTokensCount = list.length;

  let best = list[0] || { ticker: 'BEL-AFCR-04', name: 'Akash AFCR', change24h: 4.8 };
  let worst = list[0] || { ticker: 'BEL-CSR-MK3', name: 'Coastal Radar', change24h: -1.4 };

  for (const a of list) {
    if (a.change24h > best.change24h) best = a;
    if (a.change24h < worst.change24h) worst = a;
  }

  // Calculate weighted 24h net yield
  const netYield24h = totalValue > 0
    ? list.reduce((sum, item) => sum + (item.marketValue * item.change24h), 0) / totalValue
    : 0;

  return {
    totalValue,
    totalHoldings,
    activeTokensCount,
    bestPerformer: { ticker: best.ticker, name: best.name, change: Number(best.change24h.toFixed(1)) },
    worstPerformer: { ticker: worst.ticker, name: worst.name, change: Number(worst.change24h.toFixed(1)) },
    netYield24h: Number(netYield24h.toFixed(2)),
  };
};

export const getWatchlistIds = (): string[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading watchlist", e);
  }
  return ['bel-ast-01', 'bel-ast-02', 'bel-ast-03', 'bel-ast-05'];
};

export const saveWatchlistIds = (ids: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(ids));
  } catch (e) {
    console.error("Error saving watchlist", e);
  }
};

export const getSavedCurrency = (): Currency => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY) as Currency;
    if (saved === 'USD' || saved === 'INR') return saved;
  } catch (e) {
    console.error("Error reading currency", e);
  }
  return 'INR'; // Default to INR as preferred by user
};

export const saveCurrency = (currency: Currency): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, currency);
  } catch (e) {
    console.error("Error saving currency", e);
  }
};
