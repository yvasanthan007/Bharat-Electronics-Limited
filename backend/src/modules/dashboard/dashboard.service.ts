import { dbStore } from '../../database/mockDataStore';

export class DashboardService {
  public async getSummary() {
    const totalIdentities = dbStore.users.length + 1245;
    const totalRoles = dbStore.roles.length + 19;
    const totalAssets = dbStore.assets.length + 533;
    const totalTransactions = dbStore.transactions.length + 2853;

    return {
      kpi: [
        {
          title: 'Total Identities',
          value: totalIdentities.toLocaleString(),
          growth: '↑ 12.5%',
          description: 'Active trusted identities on ledger',
          icon: 'User',
        },
        {
          title: 'Active Roles',
          value: totalRoles.toString(),
          growth: '↑ 8.3%',
          description: 'Role-based access groups',
          icon: 'Lock',
        },
        {
          title: 'Digital Assets (NFTs)',
          value: totalAssets.toLocaleString(),
          growth: '↑ 18.7%',
          description: 'Minted defense hardware tokens',
          icon: 'Tag',
        },
        {
          title: 'Transactions',
          value: totalTransactions.toLocaleString(),
          growth: '↑ 22.1%',
          description: 'Total on-chain transactions',
          icon: 'Activity',
        },
      ],
      systemHealth: {
        status: 'Optimal',
        activeValidators: 7,
        consensusLatency: '2.4s',
        blockHeight: '#2,345,678',
      },
    };
  }

  public async getCharts() {
    return {
      transactionsChart: [
        { name: 'Mon', value: 400 },
        { name: 'Tue', value: 300 },
        { name: 'Wed', value: 550 },
        { name: 'Thu', value: 450 },
        { name: 'Fri', value: 700 },
        { name: 'Sat', value: 200 },
        { name: 'Sun', value: 150 },
      ],
      roleDistribution: [
        { name: 'Engineer', value: 499, color: '#3b82f6' },
        { name: 'Manager', value: 224, color: '#8b5cf6' },
        { name: 'User', value: 188, color: '#10b981' },
        { name: 'Auditor', value: 187, color: '#f59e0b' },
        { name: 'Administrator', value: 150, color: '#ef4444' },
      ],
      gasUsageTrends: [
        { hour: '00:00', gasUsed: 120000 },
        { hour: '04:00', gasUsed: 95000 },
        { hour: '08:00', gasUsed: 450000 },
        { hour: '12:00', gasUsed: 780000 },
        { hour: '16:00', gasUsed: 620000 },
        { hour: '20:00', gasUsed: 310000 },
      ],
    };
  }

  public async getRecentActivity() {
    return dbStore.auditLogs.map((log) => ({
      id: log.id,
      title: log.details,
      time: 'Just now',
      actor: log.userId === 'usr-admin-01' ? 'Rahul Verma (Admin)' : 'System Smart Contract',
      badge: log.action.replace('_', ' '),
      badgeColor: log.action.includes('MINT')
        ? 'bg-blue-100 text-blue-700'
        : log.action.includes('ROLE')
        ? 'bg-orange-100 text-orange-700'
        : 'bg-emerald-100 text-emerald-700',
      cryptographicHash: log.cryptographicHash,
      timestamp: log.timestamp,
    }));
  }

  public async getBlockchainStatus() {
    return {
      status: 'Connected',
      network: 'BEL Sovereign Testnet',
      chainId: 98234,
      latestBlock: '#2,345,678',
      blockTime: '2.4s',
      gasPrice: '20 Gwei',
      activeValidators: 7,
      consensusMechanism: 'IBFT 2.0 (Proof of Authority)',
      rpcEndpoint: 'https://rpc-testnet.trust.bel.co.in',
      isHealthy: true,
    };
  }
}

export const dashboardService = new DashboardService();
