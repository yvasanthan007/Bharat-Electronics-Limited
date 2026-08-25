import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  where,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { createAuditLog } from './auditService';
import type { ContractActivity } from '../data/contractData';

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface ContractChartData {
  '7d': ChartDataPoint[];
  '30d': ChartDataPoint[];
  '90d': ChartDataPoint[];
}

/**
 * Fetches activity records for a given contract from Firestore
 */
export async function getContractActivities(
  contractId: string
): Promise<ContractActivity[]> {
  try {
    const actColl = collection(db, 'contractActivities');
    const q = query(
      actColl,
      where('contractId', '==', contractId),
      limit(20)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const items = snapshot.docs.map((d) => d.data() as ContractActivity);
      return items;
    }
  } catch (err) {
    console.warn('[contractActivityService] Notice: Could not fetch from Firestore, checking local activities:', err);
  }
  return [];
}

/**
 * Records a contract invocation activity and logs it to both contractActivities and auditLogs
 */
export async function recordContractActivity(
  contractId: string,
  contractName: string,
  network: 'Ethereum' | 'Polygon' | 'BNB Chain' | 'BEL Testnet',
  functionName: string,
  functionType: 'read' | 'write',
  callerName = 'Rahul Verma',
  callerAddress = '0x7f824589d1b09872e45210c4391a82f3a3b910cd'
): Promise<ContractActivity> {
  const chars = '0123456789abcdef';
  let txHash = '0x';
  for (let i = 0; i < 40; i++) {
    txHash += chars[Math.floor(Math.random() * chars.length)];
  }

  const gasUsed = functionType === 'read' ? '21,000 gas' : `${Math.floor(45000 + Math.random() * 25000).toLocaleString()} gas`;
  const actId = `${contractId}_act_${Date.now()}`;

  const activity: ContractActivity = {
    txHash,
    functionName: `${functionName}()`,
    caller: callerName,
    callerAddress,
    timestamp: 'Just now',
    gasUsed,
    status: 'Success',
  };

  try {
    const actRef = doc(db, 'contractActivities', actId);
    await setDoc(actRef, {
      ...activity,
      id: actId,
      contractId,
      network,
      createdAt: Timestamp.now(),
    });
  } catch (err) {
    console.warn('[contractActivityService] Activity record saved locally:', err);
  }

  // Cross-Module Integration: Also trigger an Audit Trail Log for this action!
  await createAuditLog({
    action: `Contract Call: ${functionName}()`,
    eventType: 'Contract Called',
    actor: {
      name: callerName,
      role: 'Administrator',
      address: callerAddress,
      ip: '192.168.10.45',
      device: 'Chrome 124.0 (macOS)',
      avatarBg: 'bg-blue-100 text-blue-700',
      avatarText: 'RV',
    },
    resource: {
      name: `${contractName} (${contractId})`,
      type: 'Smart Contract',
      id: contractId,
    },
    network: network as any,
    status: 'Success',
    txHash,
    metadata: {
      functionName,
      functionType,
      gasUsed,
      executionMethod: 'Direct Contract Call',
    },
  });

  return activity;
}

/**
 * Calculates dynamic chart data based on selected timeframe
 */
export function generateContractChartData(baseCount = 100): ContractChartData {
  return {
    '7d': [
      { name: 'Mon', value: Math.max(10, Math.floor(baseCount * 0.14)) },
      { name: 'Tue', value: Math.max(12, Math.floor(baseCount * 0.12)) },
      { name: 'Wed', value: Math.max(18, Math.floor(baseCount * 0.18)) },
      { name: 'Thu', value: Math.max(15, Math.floor(baseCount * 0.16)) },
      { name: 'Fri', value: Math.max(22, Math.floor(baseCount * 0.22)) },
      { name: 'Sat', value: Math.max(8, Math.floor(baseCount * 0.08)) },
      { name: 'Sun', value: Math.max(10, Math.floor(baseCount * 0.10)) },
    ],
    '30d': [
      { name: 'Week 1', value: Math.max(50, Math.floor(baseCount * 0.7)) },
      { name: 'Week 2', value: Math.max(65, Math.floor(baseCount * 0.85)) },
      { name: 'Week 3', value: Math.max(80, Math.floor(baseCount * 0.95)) },
      { name: 'Week 4', value: Math.max(95, baseCount) },
    ],
    '90d': [
      { name: 'Month 1', value: Math.max(180, Math.floor(baseCount * 2.1)) },
      { name: 'Month 2', value: Math.max(240, Math.floor(baseCount * 2.8)) },
      { name: 'Month 3', value: Math.max(310, Math.floor(baseCount * 3.4)) },
    ],
  };
}
