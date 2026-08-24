export interface Transaction {
  hash: string;
  date: string;
  type: 'Sent' | 'Received' | 'Swap' | 'Bridge' | 'Stake' | 'Unstake' | 'Mint' | 'Burn';
  asset: string;
  network: string;
  from: string;
  to: string;
  amount: number;
  fee: number;
  status: 'Success' | 'Pending' | 'Failed' | 'Cancelled';
  usdValue: number;
  blockNumber: number;
  explorerLink: string;
  memo: string;
  confirmations: number;
}

export interface TransactionSummaryData {
  totalTransactions: number;
  successful: number;
  pending: number;
  failed: number;
  volume: number;
  feesPaid: number;
}

export const getTransactions = async (): Promise<Transaction[]> => {
  return Array.from({ length: 25 }).map((_, i) => {
    const isSuccess = i % 8 !== 0;
    const isPending = i % 7 === 0;
    const types: Transaction['type'][] = ['Sent', 'Received', 'Swap', 'Bridge', 'Stake'];
    const type = types[i % types.length];
    
    return {
      hash: `0x${Math.random().toString(16).slice(2, 64).padEnd(64, '0')}`,
      date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString(),
      type,
      asset: ['ETH', 'USDC', 'SOL', 'MATIC'][i % 4],
      network: ['Ethereum', 'Polygon', 'Solana', 'Arbitrum'][i % 4],
      from: `0x${Math.random().toString(16).slice(2, 42).padEnd(42, '0')}`,
      to: `0x${Math.random().toString(16).slice(2, 42).padEnd(42, '0')}`,
      amount: parseFloat((Math.random() * 10).toFixed(4)),
      fee: parseFloat((Math.random() * 0.05).toFixed(4)),
      status: (isPending ? 'Pending' : isSuccess ? 'Success' : 'Failed') as Transaction['status'],
      usdValue: parseFloat((Math.random() * 5000).toFixed(2)),
      blockNumber: 15000000 + Math.floor(Math.random() * 10000),
      explorerLink: `https://etherscan.io/tx/0x...`,
      memo: i % 5 === 0 ? 'Monthly payment' : '',
      confirmations: isPending ? Math.floor(Math.random() * 10) : 64,
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getTransactionSummary = async (): Promise<TransactionSummaryData> => {
  return {
    totalTransactions: 1245,
    successful: 1190,
    pending: 12,
    failed: 43,
    volume: 1250450.0,
    feesPaid: 450.25,
  };
};
