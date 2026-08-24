import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  query,
  limit,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { ensureInitialData } from './seedService';
import { createAuditLog } from './auditService';
import { generateContractChartData } from './contractActivityService';
import { contractsMock, type SmartContractItem } from '../data/contractData';

export interface ContractFilterParams {
  searchQuery?: string;
  status?: string;
  network?: string;
  verification?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}

export interface ContractStatsResult {
  title: string;
  value: string;
  growth: string;
  description: string;
  icon: string;
}

/**
 * Fetches filtered, paginated smart contracts from Firestore (with fallback)
 */
export async function getSmartContracts(params: ContractFilterParams = {}): Promise<{
  contracts: SmartContractItem[];
  totalFilteredCount: number;
  totalTotalCount: number;
}> {
  await ensureInitialData();

  try {
    const contractsColl = collection(db, 'smartContracts');
    const q = query(contractsColl, limit(100));
    const snapshot = await getDocs(q);

    let rawContracts: SmartContractItem[] = [];

    if (!snapshot.empty) {
      rawContracts = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as SmartContractItem;
        return {
          ...data,
          id: docSnap.id,
          chartData: data.chartData || generateContractChartData(data.transactionsCount || 100),
        };
      });
    } else {
      rawContracts = [...contractsMock];
    }

    const totalTotalCount = rawContracts.length;

    // Apply Filter Logic
    const filtered = rawContracts.filter((item) => {
      // Search
      if (params.searchQuery && params.searchQuery.trim()) {
        const qStr = params.searchQuery.toLowerCase();
        const matchesName = item.name?.toLowerCase().includes(qStr);
        const matchesAddress = item.address?.toLowerCase().includes(qStr);
        const matchesSymbol = item.symbol?.toLowerCase().includes(qStr);
        const matchesNetwork = item.network?.toLowerCase().includes(qStr);
        const matchesDesc = item.description?.toLowerCase().includes(qStr);
        const matchesType = item.type?.toLowerCase().includes(qStr);

        if (
          !matchesName &&
          !matchesAddress &&
          !matchesSymbol &&
          !matchesNetwork &&
          !matchesDesc &&
          !matchesType
        ) {
          return false;
        }
      }

      // Status
      if (
        params.status &&
        params.status !== 'All Statuses' &&
        item.status !== params.status
      ) {
        return false;
      }

      // Network
      if (
        params.network &&
        params.network !== 'All Networks' &&
        item.network !== params.network
      ) {
        return false;
      }

      // Verification
      if (
        params.verification &&
        params.verification !== 'All Verification' &&
        item.verification?.status !== params.verification
      ) {
        return false;
      }

      // Contract Type
      if (
        params.type &&
        params.type !== 'All Types' &&
        item.type !== params.type
      ) {
        return false;
      }

      return true;
    });

    const totalFilteredCount = filtered.length;
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    const paginatedContracts = filtered.slice(start, start + pageSize);

    return {
      contracts: paginatedContracts,
      totalFilteredCount,
      totalTotalCount,
    };
  } catch (err) {
    console.error('[smartContractService] Error fetching contracts from Firestore:', err);
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    return {
      contracts: contractsMock.slice(start, start + pageSize),
      totalFilteredCount: contractsMock.length,
      totalTotalCount: contractsMock.length,
    };
  }
}

/**
 * Fetches a single smart contract by ID
 */
export async function getSmartContractById(id: string): Promise<SmartContractItem | null> {
  try {
    const docRef = doc(db, 'smartContracts', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as SmartContractItem;
      return {
        ...data,
        id: docSnap.id,
        chartData: data.chartData || generateContractChartData(data.transactionsCount || 100),
      };
    }
    return contractsMock.find((c) => c.id === id) || null;
  } catch (err) {
    console.error('[smartContractService] Error fetching contract by ID:', err);
    return contractsMock.find((c) => c.id === id) || null;
  }
}

/**
 * Calculates dynamic statistics for the Smart Contracts page
 */
export async function getContractStatistics(): Promise<ContractStatsResult[]> {
  try {
    const contractsColl = collection(db, 'smartContracts');
    const snapshot = await getDocs(contractsColl);

    const allContracts: SmartContractItem[] = !snapshot.empty
      ? snapshot.docs.map((d) => d.data() as SmartContractItem)
      : [...contractsMock];

    const totalCount = allContracts.length;
    const activeCount = allContracts.filter((c) => c.status === 'Active').length;
    const verifiedCount = allContracts.filter((c) => c.verification?.status === 'Verified').length;
    const totalTransactions = allContracts.reduce(
      (sum, c) => sum + (c.transactionsCount || 0),
      0
    );

    const activePct = totalCount > 0 ? ((activeCount / totalCount) * 100).toFixed(1) : '100';
    const verifiedPct = totalCount > 0 ? ((verifiedCount / totalCount) * 100).toFixed(1) : '100';

    return [
      {
        title: 'Total Contracts',
        value: String(totalCount),
        growth: '↑ Active registry',
        description: 'Across 4 supported networks',
        icon: 'Code2',
      },
      {
        title: 'Active Contracts',
        value: String(activeCount),
        growth: `${activePct}%`,
        description: 'Operational & responsive',
        icon: 'CheckCircle2',
      },
      {
        title: 'Verified Contracts',
        value: String(verifiedCount),
        growth: `${verifiedPct}%`,
        description: 'Source code & ABI verified',
        icon: 'ShieldCheck',
      },
      {
        title: 'Transactions',
        value: totalTransactions.toLocaleString(),
        growth: '↑ 22.1%',
        description: 'Total on-chain contract calls',
        icon: 'Activity',
      },
    ];
  } catch (err) {
    console.error('[smartContractService] Error calculating contract statistics:', err);
    return [
      { title: 'Total Contracts', value: '18', growth: '↑ 2 new', description: 'Across 4 supported networks', icon: 'Code2' },
      { title: 'Active Contracts', value: '15', growth: '83.3%', description: 'Operational & responsive', icon: 'CheckCircle2' },
      { title: 'Verified Contracts', value: '14', growth: '93.3%', description: 'Source code & ABI verified', icon: 'ShieldCheck' },
      { title: 'Transactions', value: '2,856', growth: '↑ 22.1%', description: 'Total on-chain contract calls', icon: 'Activity' },
    ];
  }
}

/**
 * Creates and registers a new Smart Contract record in Firestore AND generates an Audit Log
 */
export async function createContractRecord(
  payload: {
    name: string;
    symbol?: string;
    type: SmartContractItem['type'];
    network: SmartContractItem['network'];
    description?: string;
    owner?: string;
    address?: string;
  },
  adminActorName = 'Rahul Verma'
): Promise<SmartContractItem> {
  const chars = '0123456789abcdef';
  const generatedAddress =
    payload.address ||
    '0x' + Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * 16)]).join('');
  const contractId = `CTR-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date();
  const dateStr = `${now.toISOString().split('T')[0]} 12:00 UTC`;

  const newContract: SmartContractItem = {
    id: contractId,
    name: payload.name.trim(),
    symbol: payload.symbol?.trim() || `BEL-${payload.name.slice(0, 3).toUpperCase()}`,
    type: payload.type,
    network: payload.network,
    chainId:
      payload.network === 'Ethereum'
        ? 1
        : payload.network === 'Polygon'
        ? 137
        : payload.network === 'BNB Chain'
        ? 56
        : 2026,
    address: generatedAddress,
    version: 'v1.0.0',
    verification: {
      status: 'Verified',
      sourceVerified: true,
      abiAvailable: true,
      compiler: 'v0.8.24+commit.e11b9ed9',
      license: 'MIT',
      verifiedAt: dateStr,
    },
    status: 'Active',
    transactionsCount: 1,
    lastActivity: 'Just now',
    owner: payload.owner || '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
    ownerName: `${adminActorName} (Admin)`,
    deployedAt: dateStr,
    lastUpdated: dateStr,
    description:
      payload.description?.trim() ||
      `Newly registered ${payload.type} smart contract on ${payload.network}.`,
    security: {
      status: 'Healthy',
      checks: [
        { label: 'Source Code Verified', passed: true, description: 'Solidity 0.8.24 bytecode verified' },
        { label: 'Contract Address Verified', passed: true, description: 'Registered in BEL Trust Ledger' },
        { label: 'Ownership Configured', passed: true, description: 'Admin multi-sig governance attached' },
        { label: 'Access Control Enabled', passed: true, description: 'OpenZeppelin RBAC v5.0 active' },
        { label: 'No Critical Alerts', passed: true, description: 'Zero audit warnings' },
      ],
    },
    functions: [
      {
        name: 'getOwner',
        signature: 'getOwner()',
        type: 'read',
        accessLevel: 'Public',
        lastCalled: 'Just now',
        callsCount: 1,
        description: 'Returns contract owner address.',
        inputs: [],
        returnType: 'address owner',
      },
      {
        name: 'isOperational',
        signature: 'isOperational()',
        type: 'read',
        accessLevel: 'Public',
        lastCalled: 'Just now',
        callsCount: 1,
        description: 'Returns true if contract is active and operational.',
        inputs: [],
        returnType: 'bool operational',
      },
    ],
    recentActivity: [
      {
        txHash: '0x' + Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * 16)]).join(''),
        functionName: 'deploy()',
        caller: adminActorName,
        callerAddress: payload.owner || '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
        timestamp: 'Just now',
        gasUsed: '840,100 gas',
        status: 'Success',
      },
    ],
    chartData: generateContractChartData(1),
  };

  try {
    const docRef = doc(db, 'smartContracts', contractId);
    await setDoc(docRef, {
      ...newContract,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`[smartContractService] New contract record ${contractId} saved to Firestore`);
  } catch (err) {
    console.warn('[smartContractService] Contract record saved locally (Firestore offline):', err);
  }

  // Cross-Module Integration: Log admin action to Audit Trail
  await createAuditLog({
    action: 'Contract Deployed',
    eventType: 'Contract Deployed',
    actor: {
      name: adminActorName,
      role: 'Administrator',
      address: payload.owner || '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
      ip: '192.168.10.45',
      device: 'Chrome 124.0 (macOS)',
      avatarBg: 'bg-blue-100 text-blue-700',
      avatarText: 'RV',
    },
    resource: {
      name: `${newContract.name} (${newContract.symbol})`,
      type: 'Smart Contract',
      id: newContract.address,
    },
    network: newContract.network,
    status: 'Success',
    txHash: newContract.recentActivity[0]?.txHash,
    metadata: {
      contractId: newContract.id,
      compiler: newContract.verification.compiler,
      version: newContract.version,
      deployer: adminActorName,
    },
  });

  return newContract;
}

/**
 * Updates contract status (Active, Paused, Deprecated) in Firestore and logs audit trail
 */
export async function updateContractStatus(
  contractId: string,
  newStatus: SmartContractItem['status'],
  adminActorName = 'Rahul Verma'
): Promise<boolean> {
  try {
    const docRef = doc(db, 'smartContracts', contractId);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: Timestamp.now(),
      lastUpdated: `${new Date().toISOString().split('T')[0]} 12:00 UTC`,
    });

    // Cross-Module: Log audit entry
    await createAuditLog({
      action: `Contract Status Updated to ${newStatus}`,
      eventType: 'Contract Updated',
      actor: {
        name: adminActorName,
        role: 'Administrator',
        address: '0x7f824589d1b09872e45210c4391a82f3a3b910cd',
        ip: '192.168.10.45',
        device: 'Chrome 124.0 (macOS)',
        avatarBg: 'bg-blue-100 text-blue-700',
        avatarText: 'RV',
      },
      resource: {
        name: `Contract ${contractId}`,
        type: 'Smart Contract',
        id: contractId,
      },
      network: 'BEL Testnet',
      status: 'Success',
      metadata: {
        contractId,
        newStatus,
      },
    });

    return true;
  } catch (err) {
    console.error('[smartContractService] Error updating contract status:', err);
    return false;
  }
}

/**
 * Subscribes to real-time updates for smart contracts
 */
export function subscribeToSmartContracts(
  onUpdate: (contracts: SmartContractItem[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  try {
    const contractsColl = collection(db, 'smartContracts');
    const q = query(contractsColl, limit(50));

    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const contracts = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as SmartContractItem;
            return {
              ...data,
              id: docSnap.id,
              chartData: data.chartData || generateContractChartData(data.transactionsCount || 100),
            };
          });
          onUpdate(contracts);
        }
      },
      (err) => {
        console.warn('[smartContractService] onSnapshot listener warning:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn('[smartContractService] Fallback: Firestore snapshot unavailable:', err);
    return () => {};
  }
}
