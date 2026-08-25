import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { auditEventsMock } from '../data/auditData';
import { contractsMock } from '../data/contractData';

let hasSeededLocally = false;

/**
 * Checks if collections in Firestore are populated. If empty, seeds initial realistic dataset.
 */
export async function ensureInitialData(): Promise<void> {
  if (hasSeededLocally) return;

  try {
    const auditColl = collection(db, 'auditLogs');
    const contractsColl = collection(db, 'smartContracts');

    const [auditSnap, contractSnap] = await Promise.allSettled([
      getDocs(auditColl),
      getDocs(contractsColl),
    ]);

    const isAuditEmpty = auditSnap.status === 'fulfilled' ? auditSnap.value.empty : true;
    const isContractEmpty = contractSnap.status === 'fulfilled' ? contractSnap.value.empty : true;

    // Seed contracts if empty
    if (isContractEmpty && contractSnap.status === 'fulfilled') {
      console.log('[BEL Seeder] Initializing smartContracts collection...');
      for (const contract of contractsMock) {
        const contractRef = doc(db, 'smartContracts', contract.id);
        await setDoc(contractRef, {
          ...contract,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        // Also seed activities for this contract
        if (contract.recentActivity && contract.recentActivity.length > 0) {
          for (let i = 0; i < contract.recentActivity.length; i++) {
            const act = contract.recentActivity[i];
            const actId = `${contract.id}_act_${i + 1}`;
            const actRef = doc(db, 'contractActivities', actId);
            await setDoc(actRef, {
              id: actId,
              contractId: contract.id,
              txHash: act.txHash,
              functionName: act.functionName,
              caller: act.caller,
              callerAddress: act.callerAddress,
              timestamp: act.timestamp,
              gasUsed: act.gasUsed,
              status: act.status,
              network: contract.network,
              createdAt: Timestamp.now(),
            });
          }
        }
      }
    }

    // Seed audit logs if empty
    if (isAuditEmpty && auditSnap.status === 'fulfilled') {
      console.log('[BEL Seeder] Initializing auditLogs collection...');
      for (const evt of auditEventsMock) {
        const auditRef = doc(db, 'auditLogs', evt.id);
        await setDoc(auditRef, {
          ...evt,
          createdAt: Timestamp.now(),
        });
      }
    }

    hasSeededLocally = true;
  } catch (error) {
    console.warn('[BEL Seeder] Notice: Firestore initialization check skipped or offline:', error);
  }
}
